var bank=angular.module('starter.controllers', ['ionic', 'ngCordova']);
var urlglobal = 'http://mbankwcfdataservice.azurewebsites.net/mBankDataService.svc';
var urlglobals = 'http://mbankwcfdataservices.azurewebsites.net/mBankDataService.svc'

bank.filter('unique', function () {
     return function (collection, keyname) {
         var output = [],
             keys = [];

         angular.forEach(collection, function (item) {
             var key = item[keyname];
             if (keys.indexOf(key) === -1) {
                 keys.push(key);
                 output.push(item);
             }
         });

         return output;
     };
 })
//Login Controller
bank.controller('LogCtrl', function ($scope, $rootScope, $interval, $http, $cordovaFile, $ionicPlatform, $ionicSideMenuDelegate, $ionicLoading, $ionicHistory, $filter, $timeout, $stateParams, $ionicPopup, $location, $state, $cordovaSQLite) {
    var db = window.openDatabase("mBank.db", "1.0", "mBank DB", 1024 * 1024 * 100);

    $ionicHistory.clearHistory();
 
    $scope.goBM = function () {
        $state.go('login');  
    }

    $scope.goAG = function () {
        $state.go('alogin');
    }


  

        //Branch Manager Login Coditions
        $scope.logins = function () {
            var user = this.username;
            var password = String(this.password);

            // $rootScope.user = 'logedIn';

            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            
            $http.get(urlglobals+'/user_details').then(function (res) {
 
                var role = res.data;
                var users = role.value;
                
                var count = users.length;



            var num = 1;
            if (count > 0) {
                for (var i = 0; i < count; i++) {

                    if (users[i].login_id == user && users[i].pwd == password && users[i].role_id == 2) {
                        $ionicHistory.clearHistory();
                        $http.get(urlglobals+'/user_details' + "?$filter=login_id eq " + user + " & pwd eq '" + password + "'").then(function (res) {
                            var role = res.data;
                            var users = role.value;
                            var count = users.length;
                            $timeout(function () {
                                $location.path('appBM/bmhome/' + users[0].bank_id);
                                $rootScope.user = "admin";
                                $ionicLoading.hide();
                            }, 100);
                        })
                        num = num + 1;
                        // Set a timeout to clear loader, however you would actually call the $ionicLoading.hide(); method whenever everything is ready or loaded.
                    }

                }
                if (num == 1) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Login failed!',
                        template: 'Please LogIn With Branch Manager!'
                    });
                    $timeout(function () {
                        $ionicLoading.hide();

                    }, 100);
                }
            } else {

                $timeout(function () {
                    $ionicLoading.hide();

                }, 100);
            }

            }, function (error) {
                alert("Internet Connection is Not Available");
                $timeout(function () {
                    $ionicLoading.hide();

                }, 100);
            })

        }
    

    //Agent Login Coditions
    $scope.Agentlogins = function () {

        var agentUsername = this.agent_username;
        var agentPassword = this.agent_password;
        var isChecked = this.isChecked;
         

        $rootScope.user = 'logedIn';

        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        
        //var query = "SELECT login_id, pwd  FROM user_details WHERE pwd = ?";
        //var query = "SELECT login_id, pwd FROM user_details WHERE login_id = ? ";



        var query = "SELECT login_id, pwd FROM user_details";

        $cordovaSQLite.execute(db, query, []).then(function (res) {
            if ((parseInt(res.rows.item(0).login_id)) == agentUsername && res.rows.item(0).pwd == agentPassword) {
                // Set a timeout to clear loader, however you would actually call the $ionicLoading.hide(); method whenever everything is ready or loaded.
               
                if (isChecked == true){
                var queryur = "update running_seq set loginStatus = ?";
                $cordovaSQLite.execute(db, queryur, [3]).then(function(res){ 
                });
                $ionicHistory.clearHistory();
                $timeout(function () {
                    $state.go('app.home');
                    $ionicLoading.hide();
                }, 100);
                $rootScope.user = 'agent';
                }
                else {
                    $ionicHistory.clearHistory();
                    $timeout(function () {
                        $state.go('app.home');
                        $ionicLoading.hide();
                    }, 100);
                    $rootScope.user = 'agent';
                }
            } else {
                $timeout(function () {
                    $ionicLoading.hide();

                }, 1000);
                var alertPopup = $ionicPopup.alert({
                    title: 'Login failed!',
                    template: 'Please check your credentials!'
                });
            }
        }, function (resp) {
            $timeout(function () {
                $ionicLoading.hide();

            }, 1000);
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Data Not Updated in Tablet!'
            });
        })


        $timeout(function () {
             
            $ionicLoading.hide();

        }, 100);

    }




})

//User Controller
bank.controller('UserCtrl', function ($scope, $ionicModal, $location, $rootScope, $ionicPlatform, $ionicSideMenuDelegate, $filter, $ionicHistory, $ionicPopup, $state, $http, $stateParams, $cordovaSQLite, $cordovaPrinter, $ionicLoading, $timeout) {
    
    $scope.clear=function(){
        $scope.search = null;
    }
    
    $scope.CheckLogin = function () {
        if ($rootScope.user == null) {
            $state.go('login');
        }
    };

    $scope.doParseInt = function (val) {
        if (val && val != "")
            return parseInt(val)
    }
    var doParseInt = $scope.doParseInt;

    $scope.exact_BM = $state.params.bm_id;
    var exact_BM = $scope.exact_BM;
 
   
    $http.get(urlglobal + '/agents?$filter=bank_id eq ' + doParseInt(exact_BM)).then(function (resp) {

            var msg = resp.data;
            var agent = msg.value;
            console.log(msg.value);
            console.log(msg);
            $scope.agents = agent; 

        }, function (err) {
        })


    $scope.getAgentDataServer = function () {
        $http.get(urlglobal + '/agents?$filter=bank_id eq ' + doParseInt(exact_BM)).then(function (resp) {

            var msg = resp.data;
            var agent = msg.value;
            $scope.agents = agent;

        }, function (err) {
        })

    }
     

    $scope.logout = function () {
        $rootScope.user = null;
        $cordovaSQLite.execute(db, "SELECT * from agent").then(function (result) {

            switch (result.rows.length) {
                case 0:
                    var queryur = "update running_seq set loginStatus = ?";
                    $cordovaSQLite.execute(db, queryur, [0]).then(function (res) {
                    });
                    $ionicHistory.clearHistory();
                    $scope.logoutt = true; 
                    $state.go('login');
                    $rootScope.user = null;
                    break;
                default:
                    var queryur = "update running_seq set loginStatus = ?";
                    $cordovaSQLite.execute(db, queryur, [0]).then(function (res) {
                    });
                    $state.go('alogin');
                    $rootScope.user = null;
            }
        }, function (error) { });
        history.go(0);
    };


    $scope.DD = function () {
        $scope.depositeMoney = this.agent.agent_name;
        $scope.modal.show();


    };


    $scope.exact_user = $state.params.user_id;
    
    //Fetch System Current Date And Time
    $scope.ModifiedDate = $filter('date')(new Date(), 'ddMMyyyy');
    $scope.ModifiedDatee = $filter('date')(new Date(), 'HHMMss');

    var DateForToday = $scope.ModifiedDate;
    var TimeForToday = $scope.ModifiedDatee;
    //-----------


    $scope.showme = false;
    $scope.getLogin = function () {
        $scope.showme = true;
    }

    //Exact ID for route
    $scope.doParseInt = function (val) {
        if (val && val != "")
            return parseInt(val)
    }

    
   
    $scope.getAgents = function () {


        $location.path('/appBM/assignAgent/' + exact_BM);
        
        //$state.go('app.assignAgent');
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        $timeout(function () {
            //Fetch Agent from Server Database
            $http.get(urlglobal + '/agents?$filter=bank_id eq '+ doParseInt(exact_BM)).then(function (resp) {

                var msg = resp.data;
                var agent = msg.value;
                $scope.agents = agent;

            }, function (err) {
            })

            $ionicLoading.hide();

        }, 100);
    }
     
    $scope.DD = function () {

        $scope.modal.show();
    };
    $scope.DDD = function () {

        $scope.modal.hide();
    };

    $ionicModal.fromTemplateUrl('deleteRecord', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });


    $scope.deleteRecordSQLite = function () {

        var query1 = "DELETE FROM agent";
        var query2 = "DELETE FROM user_details";
        var query3 = "DELETE FROM bank";
        var query4 = "DELETE FROM branch";
        var query5 = "DELETE FROM account";
        var query6 = "DELETE FROM customer";
        var query7 = "DELETE FROM role_details";
        var query8 = "DELETE FROM trx_details";
        var query9 = "DELETE FROM trx_status_details";
        var query10 = "DELETE FROM running_seq";

        $cordovaSQLite.execute(db, query1, []).then(function (res, statuses) {
            console.log('Agent Deleted');
        })
        $cordovaSQLite.execute(db, query2, []).then(function (res, statuses) {
            console.log('user_details Deleted');
        })
        $cordovaSQLite.execute(db, query3, []).then(function (res, statuses) {
            console.log('bank Deleted');
        })
        $cordovaSQLite.execute(db, query4, []).then(function (res, statuses) {
            console.log('branch Deleted');
        })
        $cordovaSQLite.execute(db, query5, []).then(function (res, statuses) {
            console.log('account Deleted');
        })
        $cordovaSQLite.execute(db, query6, []).then(function (res, statuses) {
            console.log('customer Deleted');
        })
        $cordovaSQLite.execute(db, query7, []).then(function (res, statuses) {
            console.log('role_details Deleted');
        })
        $cordovaSQLite.execute(db, query8, []).then(function (res, statuses) {
            console.log('trx_details Deleted');
        })
        $cordovaSQLite.execute(db, query9, []).then(function (res, statuses) {
            console.log('trx_status_details Deleted');
        })
        //$cordovaSQLite.execute(db, query10, []).then(function (res, statuses) {
        //    console.log('running_seq Deleted');

        //})

        var alertPopup = $ionicPopup.alert({
            title: 'Record Deleted!',
            template: 'All Record Was Deleted!'
        });

        $scope.modal.hide();

    }


  
    //Fetch Bank Name from Server Database
    $http.get(urlglobal+'/banks?$filter=bank_id eq ' + doParseInt(exact_BM)).then(function (resp) {
        var msg = resp.data;
        var banks = msg.value;
        $scope.banks = banks[0].bank_name;
    }, function (err) {
    })


    //Assign Agent To Tablet/Mobile
    $scope.assignAgent = function () {
        if (this.password == this.ConformPassword) {
            var loginid = this.loginid;
            var external_agent_id = this.external_agent_id;
            var seq_query = "update running_seq set status = ?";
            $cordovaSQLite.execute(db, seq_query, ['NO']).then(function (res) {})
            var role_id = this.role_id;
            var status = this.status;
            var is_sync = this.is_sync;
            var sync_dt = this.sync_dt;
            var bank_sync_dt = this.bank_sync_dt;
            var agent_id = this.agent_id;
            var pass = this.password;
            $scope.ModifiedDate = $filter('date')(new Date(), 'dd/MM/yyyy');
            var ModifiedDate = $scope.ModifiedDate;
            var balance = '';
            var request = $http({
                method: "put",
                url: urlglobal+"/user_details(" + loginid + ")",
                crossDomain: true,
                data: {
                    external_login_id: external_agent_id,
                    login_id: loginid,
                    role_id: role_id,
                    status: status,
                    is_sync: is_sync,
                    sync_dt: sync_dt,
                    bank_sync_dt: bank_sync_dt,
                    pwd: this.password
                },
                headers: { 'Content-Type': 'application/json' },

            }).success(function (data) {
                 
                $ionicLoading.show({
                    content: 'Loading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                //Fetch Users Details from SErver and insert login details to SQLite Database
                $http.get(urlglobal + '/user_details?$filter=login_id eq ' + agent_id ).then(function (resp) {

                    var msg = resp.data;
                    var users = msg.value;
                    console.log(msg.value);
                    console.log(msg);
                    $scope.users = users;
                    var count = users.length;
                    var query = "INSERT INTO user_details (external_login_id, login_id, pwd, role_id, status, is_sync, sync_dt, bank_sync_dt) VALUES (?,?,?,?,?,?,?,?) ";

                    if (count > 0) {
                        for (var i = 0; i < count; i++) {
                            $cordovaSQLite.execute(db, query, [external_agent_id, users[i].login_id, pass, users[i].role_id, users[i].status, users[i].is_sync, users[i].sync_dt, users[i].bank_sync_dt]).then(function (res) {
                                console.log("User details INSERT ID test-> " + res.insertId);

                            }, function (err) {
                                console.log(err);
                            });
                        }
                    }


                }, function (err) {
                })



                //Fetch Customers from SErver and insert to SQLite Database
                $http.get(urlglobal + '/customers?$filter=agent_id eq ' + agent_id + ' and bank_id eq ' + doParseInt(exact_BM)).then(function (resp) {

                    var msg = resp.data;
                    var customers = msg.value;
                    console.log(msg.value);
                    $scope.customers = customers;

                    var count = customers.length;
                    var countT = count + '0';
                    var divTime2 = countT / 2;
                    // var divTime = divTime2.toFixed();
                    var cottime1 = (divTime2 / 4);
                    var cottime = cottime1.toFixed() + '00';
                    var divtttt = cottime * 2;
                    var divttt = divtttt * 2;

                    console.log('AAAAAAAAA BBBBBBBBBB =   ' + cottime, divttt);


                    var query = "INSERT INTO customer (external_cust_id, cust_id, cust_name, cust_local_add, cust_perm_add, cust_phno_1, cust_phno_2, cust_photo, cust_pancard_no, cust_email_id, login_id, role_id, agent_id, status, is_sync, sync_dt, bank_sync_dt ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    if (count > 0) {
                        for (var j = 0; j < count; j++) {
                            $cordovaSQLite.execute(db, query, [customers[j].external_cust_id, customers[j].cust_id, customers[j].cust_name, customers[j].cust_local_add, customers[j].cust_perm_add, customers[j].cust_phno_1, customers[j].cust_phno_2, customers[j].cust_photo, customers[j].cust_pancard_no, customers[j].cust_email_id, customers[j].login_id, customers[j].role_id, customers[j].agent_id, customers[j].status, customers[j].is_sync,
                            customers[j].sync_dt, customers[j].bank_sync_dt]).then(function (res) {
                                console.log("Customers INSERT ID test-> " + res.insertId);
                            }, function (err) {
                                console.log(err);
                            });
                        }
                    }


                    $timeout(function () {
                        $ionicLoading.hide();
                        $state.go('createdAgent');

                    }, divttt);

                }, function (err) {
                })


                //Fetch Agents from SErver and insert into SQLite Database
                $http.get(urlglobal + '/agents?$filter=login_id eq ' + loginid + ' and bank_id eq ' + doParseInt(exact_BM)).then(function (resp) {

                    var msg = resp.data;
                    var agents = msg.value;
                    $scope.agents = agents;
                    var count = agents.length;
                    if (count > 0) {
                        for (var i = 0; i < count; i++) {
                            var query = "INSERT INTO agent (external_agent_id, agent_id, agent_name, agent_phno_1, agent_phno_2, agent_email_id, agent_local_add, agent_perm_add, agent_photo, bank_id, bank_sync_dt, branch_id, external_agent_id, is_sync, login_id, role_id, status, sync_dt ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";

                            $cordovaSQLite.execute(db, query, [agents[i].external_agent_id, agents[i].agent_id, agents[i].agent_name, agents[i].agent_phno_1, agents[i].agent_phno_2, agents[i].agent_email_id, agents[i].agent_local_add, agents[i].agent_perm_add, agents[i].agent_photo, agents[i].bank_id,
                        agents[i].bank_sync_dt, agents[i].branch_id, agents[i].external_agent_id, agents[i].is_sync, agents[i].login_id, agents[i].role_id, agents[i].status, agents[i].sync_dt]).then(function (res) {
                            console.log("Agent INSERT ID test-> " + res.insertId);
                        }, function (err) {
                            console.log(err);
                        });
                        }
                    }

                }, function (err) {
                    console.error('ERR', err);
                })


                $http.get(urlglobal + '/trxn_views?$filter=agent_id eq ' + agent_id + ' and bank_id eq ' + doParseInt(exact_BM) + ' and trx_data eq ' + 3).then(function (resp) {
                    var msg = resp.data;
                    var trxnLoan = msg.value; 
                    var count = trxnLoan.length;

                    if (count > 0) {
                        for (var i = 0; i < count; i++) {
                            var query = "INSERT INTO trxn_views (external_account_id, trx_data, agent_name, trxId  , external_trx_id  , trx_id  , bank_id  , brach_id  , cust_id  , acc_id  , agent_id  ,amt  ,trx_dt  ,trx_type  ,status  ,is_sync  ,trx_balance  ,sync_dt  ,bank_sync_dt  ,external_cust_id  ,cust_name  ,external_agent_id  ,InterestAmounts,NumberOfDay ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";

                            $cordovaSQLite.execute(db, query, [trxnLoan[i].external_account_id, trxnLoan[i].trx_data, trxnLoan[i].agent_name, trxnLoan[i].trxId, trxnLoan[i].external_trx_id, trxnLoan[i].trx_id, trxnLoan[i].bank_id, trxnLoan[i].brach_id, trxnLoan[i].cust_id, trxnLoan[i].acc_id, trxnLoan[i].agent_id, trxnLoan[i].amt, trxnLoan[i].trx_dt, trxnLoan[i].trx_type, trxnLoan[i].status, trxnLoan[i].is_sync, trxnLoan[i].trx_balance, trxnLoan[i].sync_dt, trxnLoan[i].bank_sync_dt, trxnLoan[i].external_cust_id, trxnLoan[i].cust_name, trxnLoan[i].external_agent_id, trxnLoan[i].InterestAmounts, trxnLoan[i].NumberOfDay]).then(function (res) {
                            console.log("Trxn_Views INSERT ID test-> " + res.insertId);
                        }, function (err) {
                            console.log(err);
                        });
                        }
                    }

                }, function (err) {
                    console.error('ERR', err);
                })

                //Fetch Customers Accounts from SErver and insert into SQLite Database
                $http.get(urlglobal + '/accounts?$filter=agent_id eq ' + agent_id + ' and bank_id eq ' + doParseInt(exact_BM)).then(function (resp) {
                    var msg = resp.data;
                    var accounts = msg.value;
                    console.log(msg.value);
                    $scope.accounts = accounts;

                    var count = accounts.length;

                    console.log(count);
                    var query = "INSERT INTO account (external_account_id, acc_id, cust_id, balance, bank_id, branch_id, agent_id, status, is_sync, sync_dt, bank_sync_dt, Account_Type,trx_type,InstallmentDays,Percentage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    if (count > 0) {

                        for (var j = 0; j < count; j++) {
                            $cordovaSQLite.execute(db, query, [accounts[j].external_account_id, accounts[j].acc_id, accounts[j].cust_id, accounts[j].balance, accounts[j].bank_id, accounts[j].branch_id, accounts[j].agent_id, accounts[j].status, accounts[j].is_sync,
                            accounts[j].sync_dt, accounts[j].bank_sync_dt, accounts[j].Account_Type, accounts[j].trx_type, accounts[j].InstallmentDays, accounts[j].Percentage]).then(function (res) {


                                console.log("Accounts INSERT ID test-> " + res.insertId);

                            }, function (err) {
                                console.log(err);
                            });
                        }
                    }

                }, function (err) {
                    console.error('ERR', err);
                })

                //get Product
                $http.get(urlglobal + '/products?$filter=bank_id eq ' + exact_BM).then(function (resp) {
                    var msg = resp.data;
                    var product = msg.value; 
                    var count = product.length;
                     
                    var query = "INSERT INTO product (Id, pDetails, pType) VALUES (?,?,?)";
                    if (count > 0) {

                        for (var j = 0; j < count; j++) {
                            $cordovaSQLite.execute(db, query, [product[j].Id, product[j].pDetails, product[j].pType]).then(function (res) {
                                console.log("Accounts Product ID test-> " + res.insertId);
                            }, function (err) {
                                console.log(err);
                            });
                        }
                    }

                }, function (err) {
                    console.error('ERR', err);
                })
 
                $scope.password = '';
  
            }).error(function (data) {
                $timeout(function () {
                    $ionicLoading.hide();

                }, 10);

            }); 
        } else {
            this.password = '';
            this.ConformPassword = '';
            alert('Passwords Are Not Same');
        }
    }

    $scope.sync = function () {
        var query = "SELECT external_trx_id , trx_id, bank_id, branch_id, cust_id, acc_id, agent_id, amt, trx_dt, trx_type, status, is_sync, sync_dt, bank_sync_dt FROM trx_details";
        $cordovaSQLite.execute(db, query, []).then(function (res, statuses) {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });

            var dateInsert = $filter('date')(new Date(), 'dd-MM-yyyy hh:mm:ss');

            $timeout(function () {
                $ionicLoading.hide();

            }, 100);


            if (res.rows.length > 0) {

                for (var i = 0; i < res.rows.length; i++) {

                    //Hold Value In $scope
                    $scope.external_trx_id = res.rows.item(i).external_trx_id;
                    $scope.trx_id = res.rows.item(i).trx_id;
                    $scope.bank_id = res.rows.item(i).bank_id;
                    $scope.branch_id = res.rows.item(i).branch_id;
                    $scope.cust_id = res.rows.item(i).cust_id;
                    $scope.acc_id = res.rows.item(i).acc_id;
                    $scope.agent_id = res.rows.item(i).agent_id;
                    $scope.amt = res.rows.item(i).amt;
                    $scope.trx_dt = res.rows.item(i).trx_dt;
                    $scope.trx_type = res.rows.item(i).trx_type;
                    $scope.status = res.rows.item(i).status;
                    $scope.is_sync = res.rows.item(i).is_sync;
                    $scope.sync_dt = res.rows.item(i).sync_dt;
                    $scope.bank_sync_dt = res.rows.item(i).bank_sync_dt;

                    //Hold $scope Value In Variable
                    var external_trx_id = String($scope.external_trx_id);
                    var trx_id = String($scope.trx_id);
                    var bank_id = $scope.bank_id;
                    var branch_id = $scope.branch_id;
                    var cust_id = $scope.cust_id;
                    var acc_id = $scope.acc_id;
                    var agent_id = $scope.agent_id;
                    var amt = $scope.amt;
                    var trx_dt = String($scope.trx_dt);
                    var trx_type = String($scope.trx_type);
                    var status = 2;
                    var is_sync = String('true');
                    var sync_dt = String(dateInsert);
                    var bank_sync_dt = String($scope.bank_sync_dt);


                    //Current Machin Date
                    $scope.ModifiedDate = $filter('date')(new Date(), 'dd-MM-yyyy');
                    var ModifiedDate = $scope.ModifiedDate;


                    var request = $http({
                        method: "POST",
                        url: urlglobal + "/trx_details",
                        crossDomain: true,
                        data: {
                            external_trx_id: external_trx_id,
                            trx_id: trx_id,
                            bank_id: bank_id,
                            brach_id: branch_id,
                            cust_id: cust_id,
                            acc_id: acc_id,
                            agent_id: agent_id,
                            amt: amt,
                            trx_dt: trx_dt,
                            trx_type: trx_type,
                            status: status,
                            is_sync: is_sync,
                            sync_dt: sync_dt,
                            bank_sync_dt: dateInsert,
                            InterestAmount: res.rows.item(i).InterestAmount,
                            NumberOfDays: res.rows.item(i).NumberOfDays

                        },
                        headers: { 'Content-Type': 'application/json' },

                    }).success(function (data) {
                        // Set a timeout to clear loader, however you would actually call the $ionicLoading.hide(); method whenever everything is ready or loaded.


                        //Fetch Transaction Details from Server Database And Updated Local Database to Status = 03
                        $http.get(urlglobal+'/trx_details?$filter=status eq ' + 2).then(function (resp) {

                            var msg = resp.data;
                            var users = msg.value;
                            $scope.users = users;
                            var count = users.length;
                            var query = "UPDATE trx_details SET status='03' where external_trx_id = ?";

                            if (count > 0) {
                                for (var i = 0; i < count; i++) {
                                    $cordovaSQLite.execute(db, query, [users[i].external_trx_id]).then(function (res) {
                                        console.log("INSERT ID test-> " + res);

                                    }, function (err) {
                                        console.log(err);
                                    });
                                }
                            }


                        })

                        $timeout(function () {
                            $ionicLoading.hide();
                            $scope.product = [];

                            var productQuery = "SELECT Id,pDetails,pType from product";
                            $cordovaSQLite.execute(db, productQuery, []).then(function (res) {
                                console.log('Here Seeee======' + res);
                                if (res.rows.length > 0) {
                                    for (var i = 0; i < res.rows.length; i++) {
                                        $scope.product.push({
                                            id: (res.rows.item(i).Id), des: (res.rows.item(i).pDetails), type: (res.rows.item(i).pType)
                                        });
                                        console.log($scope.product)
                                    }
                                }
                                else {
                                    console.log("No results found");
                                }
                            }, function (err) {
                                console.error(err);
                            });

                            //Fetch Agent Details From Local Database
                            $scope.agentDetails = [];
                            var namec = $scope.agentDetails;
                            var query = "SELECT agent_name , agent_local_add, bank_id FROM agent";
                            $cordovaSQLite.execute(db, query, []).then(function (res) {
                                if (res.rows.length > 0) {
                                    for (var i = 0; i < res.rows.length; i++) {
                                        $scope.agentDetails.push({
                                            agent_name: (res.rows.item(i).agent_name), agent_local_add: (res.rows.item(i).agent_local_add), bank_id: (res.rows.item(i).bank_id)
                                        });
                                    }
                                }
                                else {
                                    console.log("No results found");
                                }
                            }, function (err) {
                                console.error(err);
                            });
                            //--------------//
                        }, 100);



                    }).error(function (data, statuses) {
                        $timeout(function () {
                            $ionicLoading.hide();

                        }, 100);

                    })
                }

                $timeout(function () {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Transactions Sync!',
                        template: 'Transactions Sync To Bank Server!'
                    });
                    $ionicLoading.hide();

                }, 1000);



            } else {
                $timeout(function () {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Transactions Not Found!',
                        template: 'No Transaction Yet!'
                    });
                    $ionicLoading.hide();

                }, 1000);
            }

        })

    }

})


//Menu  Controller
bank.controller("menuCtrl", function ($scope, $interval, $rootScope, $location, $ionicPlatform, $ionicHistory, $filter, $ionicModal, $cordovaSQLite, $stateParams, $state, $ionicPopup, $ionicLoading, $http, $timeout) {
    //Show Sync Option in menu Tag
    var db = window.openDatabase("mBank.db", "1.0", "mBank DB", 1024 * 1024 * 100);

    //$scope.CheckLogin = function () {
    //    //console.log($rootScope.user);
    //    if ($rootScope.user !== 'agent') {
    //        $location.path('/alogin');
    //    }
    //};

    $scope.cameraWork = function () {
        $state.go('app.cameraWork');
    }

      $scope.reqCutomer = function () {
        $state.go('app.reqCustomer');
        $scope.search = '';
    }
    $scope.CreateCust = function () {
        $state.go('app.CreateCustAcc');
        $http.get(urlglobal + "/customers").then(function (res) {

        }, function (err) {
            alert('Please Connect with Internet For Create Customer');
        });


    }
    $scope.exact_BM = $state.params.bm_id;
    var exact_BM = $scope.exact_BM;

   
    $scope.product = [];

    var productQuery = "SELECT Id,pDetails,pType from product";
    $cordovaSQLite.execute(db, productQuery, []).then(function (res) {
        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
                $scope.product.push({
                    id: (res.rows.item(i).Id), des: (res.rows.item(i).pDetails), type: (res.rows.item(i).pType)
                });
            }
        }
        else {
            console.log("No results found");
        }
    }, function (err) {
        console.error(err);
    });

    $scope.logout = function () {
        $rootScope.user = null;
        $cordovaSQLite.execute(db, "SELECT * from agent").then(function (result) {

            switch (result.rows.length) {
                case 0:
                    var queryur = "update running_seq set loginStatus = ?";
                    $cordovaSQLite.execute(db, queryur, [0]).then(function (res) {
                    });
                    $ionicHistory.clearHistory();
                    $scope.logoutt = true;
                    $state.go('login');
                    $rootScope.user = null;
                    break;

                default:
                    var queryur = "update running_seq set loginStatus = ?";
                    $cordovaSQLite.execute(db, queryur, [0]).then(function (res) {
                    });
                    $state.go('alogin');
            }


        }, function (error) { console.error(error); });


        history.go(0);
    };

    var queryagent = "SELECT * from agent";
    $cordovaSQLite.execute(db, queryagent).then(function (result) {
        if (result.rows.length == 0) {
            $scope.logoutt = false;


        } else {
            $scope.logoutt = true;

        }
    }, function (error) {
        console.error(error);
    });


    $scope.goBMHome = function () {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        $timeout(function () {
            $ionicLoading.hide();

        }, 1000);
        $location.path('/app/bmhome/' + exact_BM);

    };

    $scope.goHome = function () {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        $timeout(function () {
            $ionicLoading.hide();

        }, 1000);
        $state.go('app.home');

    };

    $scope.goRecords = function () {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        $timeout(function () {
            $ionicLoading.hide();

        }, 2000);
        $state.go('app.records');

    };

    $scope.searchDDCustomers = function () {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        $timeout(function () {
            $ionicLoading.hide();

        }, 2000);
        $location.path('/app/search/'+this.type);

    };

    $scope.searchRDCustomers = function () {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        $timeout(function () {
            $ionicLoading.hide();

        }, 2000);
        $location.path('/app/search/SAVE');

    };

    //Sync Record Via Munu
    //Synchonise Record Online

    $scope.sync = function () {
        var query = "SELECT external_trx_id , trx_id, bank_id, branch_id, cust_id, acc_id, agent_id, amt, trx_dt, trx_type, status, is_sync, sync_dt, bank_sync_dt FROM trx_details";
        $cordovaSQLite.execute(db, query, []).then(function (res, statuses) {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });

            var dateInsert = $filter('date')(new Date(), 'dd-MM-yyyy hh:mm:ss');

            $timeout(function () {
                $ionicLoading.hide();

            }, 1000);


            if (res.rows.length > 0) {

                for (var i = 0; i < res.rows.length; i++) {

                    //Hold Value In $scope
                    $scope.external_trx_id = res.rows.item(i).external_trx_id;
                    $scope.trx_id = res.rows.item(i).trx_id;
                    $scope.bank_id = res.rows.item(i).bank_id;
                    $scope.branch_id = res.rows.item(i).branch_id;
                    $scope.cust_id = res.rows.item(i).cust_id;
                    $scope.acc_id = res.rows.item(i).acc_id;
                    $scope.agent_id = res.rows.item(i).agent_id;
                    $scope.amt = res.rows.item(i).amt;
                    $scope.trx_dt = res.rows.item(i).trx_dt;
                    $scope.trx_type = res.rows.item(i).trx_type;
                    $scope.status = res.rows.item(i).status;
                    $scope.is_sync = res.rows.item(i).is_sync;
                    $scope.sync_dt = res.rows.item(i).sync_dt;
                    $scope.bank_sync_dt = res.rows.item(i).bank_sync_dt;

                    //Hold $scope Value In Variable
                    var external_trx_id = String($scope.external_trx_id);
                    var trx_id = String($scope.trx_id);
                    var bank_id = $scope.bank_id;
                    var branch_id = $scope.branch_id;
                    var cust_id = $scope.cust_id;
                    var acc_id = $scope.acc_id;
                    var agent_id = $scope.agent_id;
                    var amt = $scope.amt;
                    var trx_dt = String($scope.trx_dt);
                    var trx_type = String($scope.trx_type);
                    var status = 2;
                    var is_sync = String('true');
                    var sync_dt = String($scope.sync_dt);
                    var bank_sync_dt = String($scope.bank_sync_dt);

                    //console.log(external_trx_id + ' ' + trx_id + ' ' + bank_id + ' ' + branch_id);


                    //Current Machin Date
                    $scope.ModifiedDate = $filter('date')(new Date(), 'dd-MM-yyyy');
                    var ModifiedDate = $scope.ModifiedDate;


                    var request = $http({
                        method: "POST",
                        url: urlglobal + "/trx_details",
                        crossDomain: true,
                        data: {
                            external_trx_id: external_trx_id,
                            trx_id: trx_id,
                            bank_id: bank_id,
                            brach_id: branch_id,
                            cust_id: cust_id,
                            acc_id: acc_id,
                            agent_id: agent_id,
                            amt: amt,
                            trx_dt: trx_dt,
                            trx_type: trx_type,
                            status: status,
                            is_sync: is_sync,
                            sync_dt: sync_dt,
                            bank_sync_dt: dateInsert,
                            InterestAmount: res.rows.item(i).InterestAmount,
                            NumberOfDays: res.rows.item(i).NumberOfDays

                        },
                        headers: { 'Content-Type': 'application/json' },

                    }).success(function (data) {
                        // Set a timeout to clear loader, however you would actually call the $ionicLoading.hide(); method whenever everything is ready or loaded.


                        //Fetch Transaction Details from Server Database And Updated Local Database to Status = 03
                        $http.get(urlglobal+'/trx_details?$filter=status eq ' + 2).then(function (resp) {

                            var msg = resp.data;
                            var users = msg.value;
                            $scope.users = users;
                            var count = users.length;
                            var query = "UPDATE trx_details SET status='03' where external_trx_id = ?";

                            if (count > 0) {
                                for (var i = 0; i < count; i++) {
                                    $cordovaSQLite.execute(db, query, [users[i].external_trx_id]).then(function (res) {
                                        console.log("INSERT ID test-> " + res);

                                    }, function (err) {
                                        console.log(err);
                                    });
                                }
                            }


                        })

                        $timeout(function () {
                            $ionicLoading.hide();

                        }, 100);


                    }).error(function (data, statuses) {
                        $scope.statuses = statuses;
                        $timeout(function () {
                            $ionicLoading.hide();

                        }, 100);
                    })
                }

                $timeout(function () {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Transactions Sync!',
                        template: 'Transactions Sync To Bank Server!'
                    });
                    $ionicLoading.hide();

                }, 1000);

            } else {

                $timeout(function () {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Transactions Not Found!',
                        template: 'No Transaction Yet!'
                    });
                    $ionicLoading.hide();

                }, 1000);
            }

        })

    }


})


// Fetch User Details and Deposite Amount Code
bank.controller("UserFetchCtrl", function ($scope, $rootScope, $location, $ionicPlatform, $ionicHistory, $filter, $ionicModal, $cordovaSQLite, $stateParams, $state, $ionicPopup, $ionicLoading, $http, $timeout) {
    var db = window.openDatabase("mBank.db", "1.0", "mBank DB", 1024 * 1024 * 100);


    //$scope.CheckLogin = function () {de
    //    $scope.search = '';
    //    //console.log($rootScope.user);DailyTransactions
    //    if ($rootScope.user == null) {
    //        $location.path('/alogin');
    //    }
    //};

    $scope.clear = function () {
        $scope.search = 0;
    }

    $scope.othertrx = true;

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    $timeout(function () {
        $scope.search = '';


        var productQuery = "SELECT Id,pDetails,pType from product";
        $cordovaSQLite.execute(db, productQuery, []).then(function (res) {
            $scope.product = [];

            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.product.push({
                        id: (res.rows.item(i).Id), des: (res.rows.item(i).pDetails), type: (res.rows.item(i).pType)
                    });
                }
            }
            else {
            }
        }, function (err) {
            console.error(err);
        });

        //Fetch Agent Details From Local Database
        var namec = $scope.agentDetails;
        var query = "SELECT agent_name , agent_local_add, bank_id FROM agent";
        $cordovaSQLite.execute(db, query, []).then(function (res) {
            $scope.agentDetails = [];

            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.agentDetails.push({
                        agent_name: (res.rows.item(i).agent_name), agent_local_add: (res.rows.item(i).agent_local_add), bank_id: (res.rows.item(i).bank_id)
                    });
                }
            }
            else {
                console.log("No results found");
            }
        }, function (err) {
            console.error(err);
        });
        //--------------//


        $ionicLoading.hide();

    }, 100);

 

    $ionicHistory.clearHistory();
    $scope.product = [];

    var productQuery = "SELECT Id,pDetails,pType from product";
    $cordovaSQLite.execute(db, productQuery, []).then(function (res) {
        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
                $scope.product.push({
                    id: (res.rows.item(i).Id), des: (res.rows.item(i).pDetails), type: (res.rows.item(i).pType)
                });
            }
        }
        else {
            console.log("No results found");
        }
    }, function (err) {
        console.error(err);
    });

    //Fetch Agent Details From Local Database
    $scope.agentDetails = [];
    var namec = $scope.agentDetails; 
    var query = "SELECT agent_name , agent_local_add, bank_id FROM agent";
    $cordovaSQLite.execute(db, query, []).then(function (res) {
        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
                $scope.agentDetails.push({
                    agent_name: (res.rows.item(i).agent_name), agent_local_add: (res.rows.item(i).agent_local_add), bank_id: (res.rows.item(i).bank_id)
                });
            }
        }
        else {
            console.log("No results found");
        }
    }, function (err) {
        console.error(err);
    });
    //--------------//



    //Get Current Date and Time
    $scope.ModifiedDate = $filter('date')(new Date(), 'dd-MM-yyyy');



    $scope.ModifiedDatee = $filter('date')(new Date(), 'HHMMss');

    var DateForToday = $scope.ModifiedDate;
    var DMForToday = $scope.ModifiedDateMonth;
    var TimeForToday = $scope.ModifiedDatee;
    var dated = $scope.ModifiedDate;
    //--------------//


    var DateForToday = $scope.ModifiedDate;


    $scope.goRecords = function () {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        $timeout(function () {
           
            $ionicLoading.hide();

        }, 2000);
        $state.go('app.records');

    };


    //$scope.hist = function () {
    //    console.log($ionicHistory.currentView());

    //}

    $cordovaSQLite.execute(db, "SELECT date('now','start of month','+0 month','0 day') ammy;").then(function (res) {
        var firstday = res.rows.item(0).ammy;
        $scope.firstday = $filter('date')(firstday, 'dd-MM-yyyy');

    })
    $cordovaSQLite.execute(db, "SELECT date('now','start of month','+1 month','-1 day') ammy;").then(function (res) {
        var lastday = res.rows.item(0).ammy;
        $scope.lastday = $filter('date')(lastday, 'dd-MM-yyyy');

        var firstdays = $scope.firstday;
        var lastdays = $scope.lastday;

        var rangeDate = 'SELECT sum(amt) sumamt from trx_details where trx_dt BETWEEN ? AND ?';

        $cordovaSQLite.execute(db, rangeDate, [firstdays, lastdays]).then(function (res) {
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.thisMonthTotal = res.rows.item(i).sumamt;
                }
            }

        })

    })

   
    $cordovaSQLite.execute(db, "SELECT date('now','start of month','-1 month','0 day') ammy;").then(function (res) {
        var lfirstday = res.rows.item(0).ammy;
        $scope.lfirstday = $filter('date')(lfirstday, 'dd-MM-yyyy');


    })
    $cordovaSQLite.execute(db, "SELECT date('now','start of month','0 month','-1 day') ammy;").then(function (res) {
        var llastday = res.rows.item(0).ammy;

        $scope.llastday = $filter('date')(llastday, 'dd-MM-yyyy');

        var lfirstdays = $scope.lfirstday;
        var llastdays = $scope.llastday;

        var rangeLastDate = 'SELECT sum(amt) sumlastamt from trx_details where trx_dt BETWEEN ? AND ?';

        $cordovaSQLite.execute(db, rangeLastDate, [lfirstdays, llastdays]).then(function (res) {
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {

                    $scope.lastMonthTotal = res.rows.item(i).sumlastamt;

                }
            }

        })
    })
     

    //Select Daily Transaction From Account
    var daily_query = "SELECT * from trx_details where trx_dt = ? ";
    $cordovaSQLite.execute(db, daily_query, [DateForToday]).then(function (res) {
        $scope.dailyDepositecount = res.rows.length;

    })

    //Select All Transactions
    var all_query = "SELECT trx_dt from trx_details";
    $cordovaSQLite.execute(db, all_query, []).then(function (res) {
        $scope.allDepositedCount = res.rows.length;

    })

    var sumtoday_query = "SELECT sum(amt) amtsum FROM trx_details WHERE  trx_dt = ?";
    $cordovaSQLite.execute(db, sumtoday_query, [DateForToday]).then(function (res) {

        $scope.todaySumcollection = res.rows.item(0).amtsum;

    })

    var sumoftillmoney_query = "SELECT sum(amt) amtsum FROM trx_details ";
    $cordovaSQLite.execute(db, sumoftillmoney_query, []).then(function (res) {

        $scope.sumoftillmoney = res.rows.item(0).amtsum;

    })
   


    //Synchonise Record Online

    $scope.sync = function () {
        var query = "SELECT external_trx_id , trx_id, bank_id, branch_id, cust_id, acc_id, agent_id, amt, trx_dt, trx_type, status, is_sync, sync_dt, bank_sync_dt FROM trx_details";
        $cordovaSQLite.execute(db, query, []).then(function (res, statuses) {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
             
            var i;


            if (res.rows.length > 0) {

                for (i = 0; i < res.rows.length; i++) {

                    //Hold Value In $scope
                    $scope.external_trx_id = res.rows.item(i).external_trx_id;
                    $scope.trx_id = res.rows.item(i).trx_id;
                    $scope.bank_id = res.rows.item(i).bank_id;
                    $scope.branch_id = res.rows.item(i).branch_id;
                    $scope.cust_id = res.rows.item(i).cust_id;
                    $scope.acc_id = res.rows.item(i).acc_id;
                    $scope.agent_id = res.rows.item(i).agent_id;
                    $scope.amt = res.rows.item(i).amt;
                    $scope.trx_dt = res.rows.item(i).trx_dt;
                    $scope.trx_type = res.rows.item(i).trx_type;
                    $scope.status = res.rows.item(i).status;
                    $scope.is_sync = res.rows.item(i).is_sync;
                    $scope.sync_dt = res.rows.item(i).sync_dt;
                    $scope.bank_sync_dt = res.rows.item(i).bank_sync_dt;

                    //Hold $scope Value In Variable
                    var external_trx_id = String($scope.external_trx_id);
                    var trx_id = String($scope.trx_id);
                    var bank_id = $scope.bank_id;
                    var branch_id = $scope.branch_id;
                    var cust_id = $scope.cust_id;
                    var acc_id = $scope.acc_id;
                    var agent_id = $scope.agent_id;
                    var amt = $scope.amt;
                    var trx_dt = String($scope.trx_dt);
                    var trx_type = String($scope.trx_type);
                    var status = 2;
                    var is_sync = String('true');
                    var sync_dt = String($scope.sync_dt);
                    var bank_sync_dt = String($scope.bank_sync_dt);

                    //console.log(external_trx_id + ' ' + trx_id + ' ' + bank_id + ' ' + branch_id);


                    //Current Machin Date
                    $scope.ModifiedDate = $filter('date')(new Date(), 'dd-MM-yyyy');
                    var ModifiedDate = $scope.ModifiedDate;


                    var request = $http({
                        method: "POST",
                        url: "http://mbankwcfdataservice.azurewebsites.net/mBankDataService.svc/trx_details",
                        crossDomain: true,
                        data: {
                            external_trx_id: external_trx_id,
                            trx_id: trx_id,
                            bank_id: bank_id,
                            brach_id: branch_id,
                            cust_id: cust_id,
                            acc_id: acc_id,
                            agent_id: agent_id,
                            amt: amt,
                            trx_dt: trx_dt,
                            trx_type: trx_type,
                            status: status,
                            is_sync: is_sync,
                            sync_dt: sync_dt,
                            bank_sync_dt: null,
                            InterestAmount: res.rows.item(i).InterestAmount,
                            NumberOfDays: res.rows.item(i).NumberOfDays

                        },
                        headers: { 'Content-Type': 'application/json' },

                    }).success(function (data) {
                        // Set a timeout to clear loader, however you would actually call the $ionicLoading.hide(); method whenever everything is ready or loaded.


                        //Fetch Transaction Details from Server Database And Updated Local Database to Status = 03
                        $http.get(urlglobal+'/trx_details?$filter=status eq ' + 2).then(function (resp) {

                            var msg = resp.data;
                            var users = msg.value;
                            console.log(msg.value);
                            console.log(msg);
                            $scope.users = users;
                            var count = users.length;
                            var query = "UPDATE trx_details SET status='03' where external_trx_id = ?";

                            if (count > 0) {
                                for (var i = 0; i < count; i++) {
                                    $cordovaSQLite.execute(db, query, [users[i].external_trx_id]).then(function (res) {
                                        console.log("INSERT ID test-> " + res);

                                    }, function (err) {
                                        console.log(err);
                                    });
                                }
                            }


                        })

                        $timeout(function () {
                            

                        }, 1000); 

                    }).error(function (data, statuses) {
                        $timeout(function () { 
                            $ionicLoading.hide(); 
                        }, 1000);  
                    }) 
                }

                $timeout(function () {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Transactions Sync!',
                        template: 'Transactions Sync To Bank Server!'
                    });
                    $ionicLoading.hide();

                }, 1000);

               

            } else {

                // Set a timeout to clear loader, however you would actually call the $ionicLoading.hide(); method whenever everything is ready or loaded.
                $timeout(function () {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Transactions Not Found!',
                        template: 'No Transaction Yet!'
                    });
                    $ionicLoading.hide();

                }, 1000);

               
            }

        })

    }


    $scope.deleteRecordSQLite = function () {

        var query1 = "DELETE FROM agent";
        var query2 = "DELETE FROM user_details";
        var query3 = "DELETE FROM bank";
        var query4 = "DELETE FROM branch";
        var query5 = "DELETE FROM account";
        var query6 = "DELETE FROM customer";
        var query7 = "DELETE FROM role_details";
        var query8 = "DELETE FROM trx_details";
        var query9 = "DELETE FROM trx_status_details";
        var query10 = "DELETE FROM running_seq";

        $cordovaSQLite.execute(db, query1, []).then(function (res, statuses) {
            console.log('Agent Deleted');
        })
        $cordovaSQLite.execute(db, query2, []).then(function (res, statuses) {
            console.log('user_details Deleted');
        })
        $cordovaSQLite.execute(db, query3, []).then(function (res, statuses) {
            console.log('bank Deleted');
        })
        $cordovaSQLite.execute(db, query4, []).then(function (res, statuses) {
            console.log('branch Deleted');
        })
        $cordovaSQLite.execute(db, query5, []).then(function (res, statuses) {
            console.log('account Deleted');
        })
        $cordovaSQLite.execute(db, query6, []).then(function (res, statuses) {
            console.log('customer Deleted');
        })
        $cordovaSQLite.execute(db, query7, []).then(function (res, statuses) {
            console.log('role_details Deleted');
        })
        $cordovaSQLite.execute(db, query8, []).then(function (res, statuses) {
            console.log('trx_details Deleted');
        })
        $cordovaSQLite.execute(db, query9, []).then(function (res, statuses) {
            console.log('trx_status_details Deleted');
        })
        $cordovaSQLite.execute(db, query10, []).then(function (res, statuses) {
            console.log('running_seq Deleted');

        })

        var alertPopup = $ionicPopup.alert({
            title: 'Record Deleted!',
            template: 'All Record Was Deleted!'
        });

        $state.go('login');

    }

    // Triggered in the login modal to close it
    $scope.searchCustomers = function () {

        $state.go('app.search');

    };




    $scope.getLatestTransactions = function () {
        //Select Daily Transaction From Account
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });


        var DateForToday = $scope.ModifiedDate;
          $scope.tasks = [];
    var namec = $scope.tasks;
    
    var query = "SELECT distinct(cust.cust_id) custmId, cust.external_cust_id extcust, acc.external_account_id custaccNo , acc.external_account_id extaccno, cust.cust_name custName, acc.status custAStatus, cust.status custStatus, cust.cust_local_add custAdd, acc.Account_Type accType, acc.cust_id accCustID, acc.acc_id accID FROM customer cust, account acc where cust.cust_id = acc.cust_id AND cust.is_sync='true'  and acc.Account_Type=" + $scope.exact_user;
    $cordovaSQLite.execute(db, query, []).then(function (res) {
        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
                $scope.tasks.push({
                    external_cust_id: (res.rows.item(i).extcust), cust_name: (res.rows.item(i).custName), cust_id: (parseInt(res.rows.item(i).custmId)),
                    cust_local_add: (res.rows.item(i).custAdd), Account_Type: (res.rows.item(i).accType), Account_No: (res.rows.item(i).extaccno),
                    statusCustomer: (res.rows.item(i).custStatus), statusACustomer: (res.rows.item(i).custAStatus), acc_id: (res.rows.item(i).accID)
                });
                 
            }
        }

        else {
            console.log("No results found");
         
        }

    }, function (err) {
        console.error(err);
    });

        //Select Daily Transaction From Account
        var daily_query = "SELECT * from trx_details where trx_dt = ? ";
        $cordovaSQLite.execute(db, daily_query, [DateForToday]).then(function (res) {
            $scope.dailyDepositecount = res.rows.length;

        })

        //Select All Transactions
        var all_query = "SELECT trx_dt from trx_details";
        $cordovaSQLite.execute(db, all_query, []).then(function (res) {
            $scope.allDepositedCount = res.rows.length;

        })

        var sumtoday_query = "SELECT sum(amt) amtsum FROM trx_details WHERE  trx_dt = ?";
        $cordovaSQLite.execute(db, sumtoday_query, [DateForToday]).then(function (res) {

            $scope.todaySumcollection = res.rows.item(0).amtsum;

        })

        var sumoftillmoney_query = "SELECT sum(amt) amtsum FROM trx_details ";
        $cordovaSQLite.execute(db, sumoftillmoney_query, []).then(function (res) {

            $scope.sumoftillmoney = res.rows.item(0).amtsum;

        })

       

   

        // Set a timeout to clear loader, however you would actually call the $ionicLoading.hide(); method whenever everything is ready or loaded.
        $timeout(function () {
            $ionicLoading.hide();

        }, 1000);

        $state.go('app.home');
        $rootScope.user = 'agent';


    };
  
    
    $scope.getUpdatedData = function () {
        var queryGetCust = "SELECT agent_id, bank_id FROM agent";
          $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
          });
         

          $timeout(function () {
              $ionicLoading.hide();
              $http.get(urlglobal + '/customers').then(function (resp) {

              }, function (err) {
                  var alertPopup = $ionicPopup.alert({
                      title: 'Internet Unavailable!',
                      template: 'Please Connect With the Internet!'
                  });
              })

          }, 4000);
          $cordovaSQLite.execute(db, queryGetCust, []).then(function (res) {
              var bankID = parseInt(res.rows.item(0).bank_id); var agent_id = parseInt(res.rows.item(0).agent_id);

              $http.get(urlglobal + '/customers?$filter=agent_id eq ' + agent_id + ' and bank_id eq ' + bankID).then(function (resp) {
                  var msg = resp.data; var customers = msg.value; var count = customers.length;
                  var query = "INSERT INTO customer (external_cust_id, cust_id, cust_name, cust_local_add, cust_perm_add, cust_phno_1, cust_phno_2, cust_photo, cust_pancard_no, cust_email_id, login_id, role_id, agent_id, status, is_sync, sync_dt, bank_sync_dt ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                  if (count > 0) {
                      for (var j = 0; j < count; j++) {
                          if (customers[j].is_sync == false) {
                              var updateLoan1 = 'update customer set is_sync ="false" where cust_id = ?';
                              $cordovaSQLite.execute(db, updateLoan1, [customers[j].cust_id]).then(function (res) { });
                          }
                          $cordovaSQLite.execute(db, query, [customers[j].external_cust_id, customers[j].cust_id, customers[j].cust_name, customers[j].cust_local_add, customers[j].cust_perm_add, customers[j].cust_phno_1, customers[j].cust_phno_2, customers[j].cust_photo, customers[j].cust_pancard_no, customers[j].cust_email_id, customers[j].login_id, customers[j].role_id, customers[j].agent_id, customers[j].status, customers[j].is_sync,
                          customers[j].sync_dt, customers[j].bank_sync_dt]).then(function (res) {
                              console.log("Customers INSERT ID test-> " + res.insertId);
                          }, function (err) { console.log(err); });
                      }
                  }
              }, function (err) { console.error('ERR', err); })

              $http.get(urlglobal + '/accounts?$filter=agent_id eq ' + agent_id + ' and bank_id eq ' + bankID).then(function (resp) {
                  var msg = resp.data; var accounts = msg.value; $scope.accounts = accounts; var count = accounts.length;
                  var query = "INSERT INTO account (external_account_id, acc_id, cust_id, balance, bank_id, branch_id, agent_id, status, is_sync, sync_dt, bank_sync_dt, Account_Type, trx_type,InstallmentDays,Percentage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                  if (count > 0) {
                      for (var j = 0; j < count; j++) {
                          if (accounts[j].is_sync == false) {
                              var updateLoan = 'update account set is_sync="false" where acc_id = ?';
                              $cordovaSQLite.execute(db, updateLoan, [accounts[j].acc_id]).then(function (res) { });
                          }
                          $cordovaSQLite.execute(db, query, [accounts[j].external_account_id, accounts[j].acc_id, accounts[j].cust_id, accounts[j].balance, accounts[j].bank_id, accounts[j].branch_id, accounts[j].agent_id, accounts[j].status, accounts[j].is_sync,
                          accounts[j].sync_dt, accounts[j].bank_sync_dt, accounts[j].Account_Type, accounts[j].trx_type, accounts[j].InstallmentDays, accounts[j].Percentage]).then(function (res) {
                              console.log("Accounts INSERT ID test-> " + res.insertId);
                          }, function (err) { console.log(err); });
                      }
                  }
              }, function (err) { console.error('ERR', err); })


              $http.get(urlglobal + '/trxn_views?$filter=agent_id eq ' + agent_id + ' and bank_id eq ' + bankID + ' and trx_data eq 3').then(function (resp) {
                  var msg = resp.data;
                  var trxnLoan = msg.value;
                  var count = trxnLoan.length;

                  if (count > 0) {
                      for (var i = 0; i < count; i++) {
                          var query = "INSERT INTO trxn_views (external_account_id, trx_data, agent_name, trxId  , external_trx_id  , trx_id  , bank_id  , brach_id  , cust_id  , acc_id  , agent_id  ,amt  ,trx_dt  ,trx_type  ,status  ,is_sync  ,trx_balance  ,sync_dt  ,bank_sync_dt  ,external_cust_id  ,cust_name  ,external_agent_id  ,InterestAmounts,NumberOfDay ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";

                          $cordovaSQLite.execute(db, query, [trxnLoan[i].external_account_id, trxnLoan[i].trx_data, trxnLoan[i].agent_name, trxnLoan[i].trxId, trxnLoan[i].external_trx_id, trxnLoan[i].trx_id, trxnLoan[i].bank_id, trxnLoan[i].brach_id, trxnLoan[i].cust_id, trxnLoan[i].acc_id, trxnLoan[i].agent_id, trxnLoan[i].amt, trxnLoan[i].trx_dt, trxnLoan[i].trx_type, trxnLoan[i].status, trxnLoan[i].is_sync, trxnLoan[i].trx_balance, trxnLoan[i].sync_dt, trxnLoan[i].bank_sync_dt, trxnLoan[i].external_cust_id, trxnLoan[i].cust_name, trxnLoan[i].external_agent_id, trxnLoan[i].InterestAmounts, trxnLoan[i].NumberOfDay]).then(function (res) {
                              console.log("Trxn_Views INSERT ID test-> " + res.insertId);
                          }, function (err) { console.log(err); });
                      }
                  }
              }, function (err) { console.error('ERR', err); })
          })
          var query = "SELECT distinct(cust.cust_id) custmId, cust.external_cust_id extcust, acc.external_account_id custaccNo , acc.external_account_id extaccno, cust.cust_name custName, acc.status custAStatus, cust.status custStatus, cust.cust_local_add custAdd, acc.Account_Type accType, acc.cust_id accCustID, acc.acc_id accID FROM customer cust, account acc where cust.cust_id = acc.cust_id AND cust.is_sync='true'  AND acc.Account_Type= '" + $scope.exact_user + "'";
          $cordovaSQLite.execute(db, query, []).then(function (res) {
              $scope.tasks = [];

              if (res.rows.length > 0) {
                  for (var i = 0; i < res.rows.length; i++) {
                      $scope.tasks.push({
                          external_cust_id: (res.rows.item(i).extcust), cust_name: (res.rows.item(i).custName), cust_id: (parseInt(res.rows.item(i).custmId)),
                          cust_local_add: (res.rows.item(i).custAdd), Account_Type: (res.rows.item(i).accType), Account_No: (res.rows.item(i).extaccno),
                          statusCustomer: (res.rows.item(i).custStatus), statusACustomer: (res.rows.item(i).custAStatus), acc_id: (res.rows.item(i).accID)
                      });
                  }
              }
              else {
              }
          }, function (err) {
              console.error(err);
          });

        
    }


    $scope.showMe = false;
    $scope.login = false;
    $scope.getLogin = function () {
        $scope.login = true;
    }


    //Exact Find the Number
    $scope.doParseInt = function (val) {
        if (val && val != "")
            return parseInt(val)
    }
    var doParseInt = $scope.doParseInt;
    //Route for customer

    $scope.exact_user = $state.params.user_id;
    $scope.exact_info = $state.params.user_info;
    var details = $scope.exact_user;
    var exact_info = $scope.exact_info;

    if ($scope.exact_user == 'LOAN') {
        $scope.othertrx = false;
        $scope.loantrx = true;
    } else {
        $scope.othertrx = true;
        $scope.loantrx = false;
    }

   

    //Search customers from local database view on html page UNIQUE
    $scope.tasks = [];
    
    var query = "SELECT distinct(cust.cust_id) custmId, cust.external_cust_id extcust, acc.external_account_id custaccNo , acc.external_account_id extaccno, cust.cust_name custName, acc.status custAStatus, cust.status custStatus, cust.cust_local_add custAdd, acc.Account_Type accType, acc.cust_id accCustID, acc.acc_id accID FROM customer cust, account acc where cust.cust_id = acc.cust_id AND cust.is_sync='true' AND acc.Account_Type= '" + $scope.exact_user + "'";
    $cordovaSQLite.execute(db, query, []).then(function (res) {

        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) { 
                $scope.tasks.push({
                    external_cust_id: (res.rows.item(i).extcust), cust_name: (res.rows.item(i).custName), cust_id: (parseInt(res.rows.item(i).custmId)),
                    cust_local_add: (res.rows.item(i).custAdd), Account_Type: (res.rows.item(i).accType), Account_No: (res.rows.item(i).extaccno),
                    statusCustomer: (res.rows.item(i).custStatus), statusACustomer: (res.rows.item(i).custAStatus), acc_id: (res.rows.item(i).accID)
                }); 
            }
        }
        else {
        }
    }, function (err) {
        console.error(err);
    });

  
     
    $scope.loanTrxn = [];
  
    var queryLoan = "SELECT external_account_id, trx_data, agent_name, trxId, external_trx_id, trx_id, bank_id, brach_id, cust_id, acc_id, agent_id, amt, trx_dt, trx_type, status, is_sync, trx_balance, sync_dt, bank_sync_dt, external_cust_id, cust_name, external_agent_id, InterestAmounts, NumberOfDay from trxn_views ";
    $cordovaSQLite.execute(db, queryLoan, []).then(function (res) {
        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
                $scope.loanTrxn.push({
                    status: (parseInt(res.rows.item(i).trxId)), trxId: (res.rows.item(i).trxId), trxId: (parseInt(res.rows.item(i).trxId)), acc_id: (parseInt(res.rows.item(i).acc_id)), amt: (res.rows.item(i).amt), cust_name: (res.rows.item(i).cust_name), cust_id: (parseInt(res.rows.item(i).cust_id)), trx_balance: res.rows.item(i).trx_balance, trx_dt: res.rows.item(i).trx_dt, status: res.rows.item(i).status
                });
            }
        }
        else {
        }
    }, function (err) {
        console.error(err);
    });

   
    var updateLoanLength = "SELECT status from trxn_views where acc_id =" + $scope.exact_info;
    $cordovaSQLite.execute(db, updateLoanLength, []).then(function (res) {
        console.log('Loan Length= ' + res.rows.length);
        $scope.legtnLoanFound = res.rows.length;
    });


    //Collect Loan By Agent
    $scope.collectLoan = function () {
        var updateLoan = 'update trxn_views set status = 5 where trxId = ?';
        $cordovaSQLite.execute(db, updateLoan, [this.trxId]).then(function (res) { });
        var queryLoanGet = "SELECT external_account_id, trx_data, agent_name, trxId, external_trx_id, trx_id, bank_id, brach_id, cust_id, acc_id, agent_id, amt, trx_dt, trx_type, status, is_sync, trx_balance, sync_dt, bank_sync_dt, external_cust_id, cust_name, external_agent_id, InterestAmounts, NumberOfDay from trxn_views ";
        $cordovaSQLite.execute(db, queryLoanGet, []).then(function (res) {
            $scope.loanTrxn = [];
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.loanTrxn.push({
                        status: (parseInt(res.rows.item(i).trxId)), trxId: (parseInt(res.rows.item(i).trxId)), acc_id: (parseInt(res.rows.item(i).acc_id)), amt: (res.rows.item(i).amt), cust_name: (res.rows.item(i).cust_name), cust_id: (parseInt(res.rows.item(i).cust_id)), trx_balance: res.rows.item(i).trx_balance, trx_dt: res.rows.item(i).trx_dt, status: res.rows.item(i).status
                    });

                }
            }
            else {
            }
        }, function (err) {
            console.error(err);
        });

        var alertPopup = $ionicPopup.alert({
            title: 'Loan Collected!',
            template: 'Loan Amount Collected!'
        });


    }

    //Push To Bank
    $scope.pushToBank = function () {
        var dateInsert = $filter('date')(new Date(), 'dd-MM-yyyy hh:mm:ss');
        var updateLoan = 'update trxn_views set status = 7 where trxId =' + this.trxId;
        var queryLoanGet = "SELECT external_account_id, trx_data, agent_name, trxId, external_trx_id, trx_id, bank_id, brach_id, cust_id, acc_id, agent_id, amt, trx_dt, trx_type, status, is_sync, trx_balance, sync_dt, bank_sync_dt, external_cust_id, cust_name, external_agent_id, InterestAmounts, NumberOfDay from trxn_views ";
        $http.get(urlglobal + '/trx_details?$filter=Id eq ' + this.trxId).then(function (resp) {
            var msg = resp.data;
            var users = msg.value; 
            var count = users.length;
            
            if (users[0].status == 7 || users[0].status == 10 || users[0].status == 11) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Loan Collected By Bank!',
                    template: 'Loan Amount Already Collected By Bank!'
                });
            } else {

                var request = $http({
                    method: "put",
                    url: urlglobal + "/trx_details(" + users[0].Id + ")",
                    crossDomain: true,
                    data: {
                        external_trx_id: users[0].external_trx_id,
                        trx_id: users[0].trx_id,
                        bank_id: users[0].bank_id,
                        brach_id: users[0].branch_id,
                        cust_id: users[0].cust_id,
                        acc_id: users[0].acc_id,
                        agent_id: users[0].agent_id,
                        amt: users[0].amt,
                        trx_dt: users[0].trx_dt,
                        trx_type: users[0].trx_type,
                        status: 7,
                        is_sync: users[0].is_sync,
                        sync_dt: dateInsert,
                        bank_sync_dt: users[0].bank_sync_dt,
                        balance: users[0].balance,
                        InterestAmount: users[0].InterestAmount,
                        NumberOfDays: users[0].NumberOfDays

                    },
                    headers: { 'Content-Type': 'application/json' },

                }).success(function () {
                   
                    $cordovaSQLite.execute(db, updateLoan, []).then(function (res) { });                   
                    $cordovaSQLite.execute(db, queryLoanGet, []).then(function (res) {
                        $scope.loanTrxn = [];
                        if (res.rows.length > 0) {
                            for (var i = 0; i < res.rows.length; i++) {
                                $scope.loanTrxn.push({
                                    status: (parseInt(res.rows.item(i).trxId)), trxId: (parseInt(res.rows.item(i).trxId)), acc_id: (parseInt(res.rows.item(i).acc_id)), amt: (res.rows.item(i).amt), cust_name: (res.rows.item(i).cust_name), cust_id: (parseInt(res.rows.item(i).cust_id)), trx_balance: res.rows.item(i).trx_balance, trx_dt: res.rows.item(i).trx_dt, status: res.rows.item(i).status
                                });

                            }
                        }
                        else {
                        }
                    }, function (err) {
                        console.error(err);
                    });
                    var alertPopup = $ionicPopup.alert({
                        title: 'Loan Amount Sync!',
                        template: 'Loan Amount Sync To Bank!'
                    });
                     

                }).error(function () {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Internet Unavailable!',
                        template: 'Please On Internet Connection For Push To Bank!'
                    });
                })
            
            //var updateLoan = 'update trxn_views set status = 7 where trxId = ?';
            //$cordovaSQLite.execute(db, updateLoan, [this.trxId]).then(function (res) { });
            }

        }, function (err) {
        })
       
    }

    var updateLoan = 'update trxn_views set status = 2';

    $cordovaSQLite.execute(db, updateLoan, []).then(function (res) { });

    //get Loan Update
    $scope.getDetailsLoan = function () {


        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        $http.get(urlglobal + '/trx_details?$filter=acc_id eq ' + this.accId).then(function (resp) {
            var msg = resp.data;
            var users = msg.value; 
            var count = users.length;
            for (var i = 0 ; i <= count; i++) {
                if (users[i].status == 7) {
                    var updateLoan = 'update trxn_views set status = 7 where trxId =' + users[i].Id;
                    $cordovaSQLite.execute(db, updateLoan, []).then(function (res) { });
                }

            }
             
        }) 
        $timeout(function () {
            var queryLoanGet = "SELECT external_account_id, trx_data, agent_name, trxId, external_trx_id, trx_id, bank_id, brach_id, cust_id, acc_id, agent_id, amt, trx_dt, trx_type, status, is_sync, trx_balance, sync_dt, bank_sync_dt, external_cust_id, cust_name, external_agent_id, InterestAmounts, NumberOfDay from trxn_views ";

            $cordovaSQLite.execute(db, queryLoanGet, []).then(function (res) {
                $scope.loanTrxn = [];
                if (res.rows.length > 0) {
                    for (var i = 0; i < res.rows.length; i++) {
                        $scope.loanTrxn.push({
                            status: (parseInt(res.rows.item(i).trxId)), trxId: (parseInt(res.rows.item(i).trxId)), acc_id: (parseInt(res.rows.item(i).acc_id)), amt: (res.rows.item(i).amt), cust_name: (res.rows.item(i).cust_name), cust_id: (parseInt(res.rows.item(i).cust_id)), trx_balance: res.rows.item(i).trx_balance, trx_dt: res.rows.item(i).trx_dt, status: res.rows.item(i).status
                        });

                    }
                }
                else {
                }
            }, function (err) {
                console.error(err);
            });

            $ionicLoading.hide();

        }, 1000);

        var alertPopup = $ionicPopup.alert({
            title: 'Get Successfully!',
            template: 'Bank Loan Amount Get Successfully!'
        });

    }


    $scope.custOnDeposites = [];
    var namec = $scope.custOnDeposites;
    var query = "SELECT cust.external_cust_id extcust, acc.external_account_id custaccNo ,cust.cust_id  custmId, cust.cust_name custName, cust.cust_local_add custAdd, acc.Account_Type accType, acc.cust_id accCustID,  acc.acc_id accID  FROM customer cust, account acc where cust.cust_id = acc.cust_id group by cust.cust_id AND acc.acc_id=" + exact_info;
    $cordovaSQLite.execute(db, query, []).then(function (res) {
        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {

                $scope.custOnDeposites.push({
                    external_cust_id: (res.rows.item(i).extcust), cust_name: (res.rows.item(i).custName), cust_id: (parseInt(res.rows.item(i).custmId)),
                    cust_local_add: (res.rows.item(i).custAdd), Account_Type: (res.rows.item(i).accType), accountNo: (res.rows.item(i).custaccNo), acc_id: (res.rows.item(i).accID)
                });

            }
        }

        else {
            console.log("No results found");
        }

    }, function (err) {
    });




    var customerId = $state.params.user_id;
    var exactInfo = $state.params.user_info;
    var exactNoMsg = doParseInt;

    //Search Account for customer from local database view on html
    $scope.customerAccounts = [];
    var account_query = "SELECT external_account_id, cust_id, acc_id FROM account where cust_id = ? AND Account_Type = ? ";
    $cordovaSQLite.execute(db, account_query, [exactInfo, customerId]).then(function (res) {
        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
                $scope.customerAccounts.push({
                    external_account_id: (res.rows.item(i).external_account_id), cust_id: (res.rows.item(i).cust_id),
                    acc_id: (res.rows.item(i).acc_id)
                });
            }
        }
        else {
        }

    }, function (err) {
        console.log(err);
    });


    //Test
    $ionicModal.fromTemplateUrl('Tmodel', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });


    //------------------//
    $scope.goHome = function () {
        $scope.modal.hide();
        $state.go('app.home');

    };

    $scope.searches = function () {
        $scope.modal.hide();
        $state.go('app.home');
    }


    $scope.dep = function () {
        $scope.custDetail = customerId;
        $state.go('app.detail_2');

    }



    // Open the login modal
    $scope.DD = function () {
        $scope.depositeMoney = this.depositeMoney;
        $scope.selectAccountNo = this.selectAccountNo;

        if ($scope.depositeMoney === ' ') {
            var alertPopup = $ionicPopup.alert({
                title: 'Not Allowed',
                template: 'Please Enter More than 0/- Rs',

            });
        } else {
            $scope.modal.show();
        }

    };

    $scope.todayDate = $filter('date')(new Date(), 'yyyy-MM-dd');
   
    /********Daily Deposite Code************/
    $scope.dailydeposite = function () {
        $scope.allDepositedCount = null;
        var depositeMoney = this.depositeMoney;
        var selectAccountNo = this.selectAccountNo;
     
        var dateInsert = $filter('date')(new Date(), 'dd-MM-yyyy hh:mm:ss');

        //Filter Exact Number
        $scope.doParseInt = function (val) {
            if (val && val != "")
                return parseInt(val)
        }

        if (details == 'LOAN') {var getCredit = 'dbt';} else {var getCredit = 'cr';
        }
       
       
        //Search Running Sequence Number from local database to push in database 
        var seq_query = "SELECT running_seq_no FROM running_seq";
       

        $cordovaSQLite.execute(db, seq_query, []).then(function (res) {
            var count = res.rows.length;
            if (count > 0) {
                for (var i = 0; i < res.rows.length; i++) {

                    $scope.seqDetails = (res.rows.item(i).running_seq_no);
                     
                }
            }
        })


        var doParseInt = $scope.doParseInt;
        $scope.accountDetails = [];

        //Search Accounts Info from Local Database
        var acc_query = "SELECT external_account_id, bank_id, branch_id, agent_id, cust_id, acc_id FROM account where acc_id = " + exact_info;
        console.log('Exact info==' + exact_info);
        //Insert Transaction Details to local database
        var queryys = "INSERT INTO trx_details (external_trx_id, trx_id , bank_id , branch_id , cust_id , acc_id , agent_id , amt , trx_dt , trx_type , status , is_sync , sync_dt , bank_sync_dt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";



        //Update Running Sequence Query

        //Run the Account (Select) Query
        $cordovaSQLite.execute(db, acc_query, []).then(function (res) {
            var count = res.rows.length;
            if (count > 0) {
                for (var i = 0; i < res.rows.length; i++) {

                    $scope.accountDetails.push({
                        bank_id: (res.rows.item(i).bank_id), branch_id: (res.rows.item(i).branch_id), agent_id: (parseInt(res.rows.item(i).cust_id)),
                        agent_id: (res.rows.item(i).agent_id), acc_id: (res.rows.item(i).acc_id)
                    });

                    //Call Sequence Number
                    var latestSeq = $scope.seqDetails;
                    console.log(latestSeq);
                    var latestSeqPlus = latestSeq + 1; // Running Sequence Plus Here

                    var updateRunningSequence = "UPDATE running_seq SET running_seq_no = ? ";
                    $cordovaSQLite.execute(db, updateRunningSequence, [latestSeqPlus]).then(function (res) {
                        //console.log("INSERT ID test-> " + res.insertId);
                    }, function (err) {
                        console.log(err);
                    });

                    //Hold Account Values in Variable
                    var external_account_id = res.rows.item(i).external_account_id;
                    var bank_id = res.rows.item(i).bank_id;
                    var branch_id = res.rows.item(i).branch_id;
                    var agent_id = res.rows.item(i).agent_id;
                    var cust_id = res.rows.item(i).cust_id;
                    var acc_id = res.rows.item(i).acc_id;


                    //Prefix (0)-zeros before Account values
                    var external_account_id_zero = ("00000" + external_account_id).slice(-5);
                    var bank_id_zero = ("00000" + bank_id).slice(-5);
                    var branch_id_zero = ("00000" + branch_id).slice(-5);
                    var agent_id_zero = ("000000" + agent_id).slice(-6);
                    var cust_id_zero = ("00000000000" + cust_id).slice(-11);
                    var acc_id_zero = ("00000000000" + acc_id).slice(-11);
                    var agent_id_onezero = agent_id;
                    var latestSeqence_zero = ("000000" + latestSeqPlus).slice(-6);

                    console.log(latestSeqence_zero);



                    // console.log(external_account_id_zero + ' ' + bank_id_zero + ' ' + cust_id_zero);

                    var trx_ID = bank_id_zero + '' + branch_id_zero + '' + agent_id_zero + '' + cust_id_zero + '' + acc_id_zero + '' + '' + DateForToday + '' + TimeForToday + '' + latestSeqPlus;
                    var agnt_trx_id = agent_id_onezero + '-' + latestSeqence_zero;
                    console.log('trx_ID===' + trx_ID);
                    console.log('agnt_trx_id===' + agnt_trx_id);




                    //Update Daily Transaction Detail Table
                    $cordovaSQLite.execute(db, queryys, [agnt_trx_id, trx_ID, bank_id_zero, branch_id_zero, cust_id_zero, acc_id_zero, agent_id_zero, depositeMoney, DateForToday, getCredit, '01', 'true', dateInsert, '']).then(function (res) {
                        console.log("INSERT ID test-> " + res.insertId); 
                    }, function (err) {
                        console.log(err);
                    });
                    $scope.showme = false;
                }
            }
            else {console.log("No results found");}
        }, function (err) {
            console.error(err);
        });

        //Alert For Amount Deposited
        var alertPopup = $ionicPopup.alert({
            title: 'Rs. ' + this.depositeMoney + '/- Amount Deposited',
            template: '<center>Click OK To Make Another Customer Transaction </center>',

        });


        var DateForToday = $scope.ModifiedDate;


      
     


        $scope.modal.hide();
        $state.go('app.home');

        

    }



   


})

//REcord Controllers
bank.controller("recordCtrl", function ($scope, $rootScope, $ionicPlatform, $ionicHistory, $filter, $ionicModal, $cordovaSQLite, $stateParams, $state, $ionicPopup, $ionicLoading, $http, $timeout) {
     
    var db = window.openDatabase("mBank.db", "1.0", "mBank DB", 1024 * 1024 * 100);
    $ionicHistory.clearHistory();

    //Get Current Date and Time
    $scope.ModifiedDate = $filter('date')(new Date(), 'dd-MM-yyyy');

    var DateForToday = $scope.ModifiedDate;

    $scope.SyncLocalConform = false;

    $scope.searches = DateForToday;
    var dateforsearch = $scope.searches;

    $scope.goRecords = function () {
         $scope.searches = DateForToday;
        $state.go('app.records');
        console.log(DateForToday);
        //Records details:
        $scope.SyncLocalConform = false;
        $scope.DailyTransactions = [];


        var joinTable = "Select  trx.cust_id custid, trx.external_trx_id trxExtId, trx.trx_dt trxdt, trx.amt amount, trx.trx_dt datetrx, cust.cust_name nameCust, cust.external_cust_id extCustId, acc.external_account_id accid, agnt.agent_name agntname  from trx_details trx , customer cust, account acc, agent agnt where trx.cust_id = cust.cust_id AND cust.cust_id = acc.cust_id AND  trx.agent_id = agnt.agent_id  group by trx.trx_id";



        $cordovaSQLite.execute(db, joinTable).then(function (res, statuses) {
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.DailyTransactions.push({
                        cust_id: (res.rows.item(i).custid),
                        amt: (res.rows.item(i).amount),
                        trx_dt: (res.rows.item(i).datetrx),
                        external_trx_id: (res.rows.item(i).trxExtId),
                        cust_name: (res.rows.item(i).nameCust),
                        accid: (res.rows.item(i).accid),
                        extCustId: (res.rows.item(i).extCustId),
                        trxdt: (res.rows.item(i).trxdt),
                        agntname: (res.rows.item(i).agntname)

                    });
                }
            } else {
                $scope.SyncLocalConform = true;

            }
        }, function (err) {

            $scope.SyncLocalConform = true;

        });
    };

    $scope.DailyTransactions = [];

    //Records details:
    var joinTable = "Select trx.cust_id custid, trx.external_trx_id trxExtId, trx.trx_dt trxdt, trx.amt amount, trx.trx_dt datetrx, cust.cust_name nameCust, cust.external_cust_id extCustId, acc.external_account_id accid, agnt.agent_name agntname  from trx_details trx , customer cust, account acc, agent agnt where trx.cust_id = cust.cust_id AND cust.cust_id = acc.cust_id AND  trx.agent_id = agnt.agent_id  group by trx.trx_id";


    $cordovaSQLite.execute(db, joinTable).then(function (res, statuses) {
        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
                $scope.DailyTransactions.push({
                    cust_id: (res.rows.item(i).custid),
                    amt: (res.rows.item(i).amount),
                    trx_dt: (res.rows.item(i).datetrx),
                    external_trx_id: (res.rows.item(i).trxExtId),
                    cust_name: (res.rows.item(i).nameCust),
                    accid: (res.rows.item(i).accid),
                    extCustId: (res.rows.item(i).extCustId),
                    trxdt: (res.rows.item(i).trxdt),
                    agntname: (res.rows.item(i).agntname)
                });
            }
        } else {
            $scope.SyncLocalConform = true;

        }
    }, function (err) {

        $scope.SyncLocalConform = true;

    });






})
  



// Fetch User Details and Deposite Amount Code
bank.controller("CreateCustAcc", function ($scope, $rootScope, $location, $ionicPlatform, $ionicHistory, $filter, $ionicModal, $cordovaSQLite, $stateParams, $state, $ionicPopup, $ionicLoading, $http, $timeout) {
    var db = window.openDatabase("mBank.db", "1.0", "mBank DB", 1024 * 1024 * 100);
    

   

    $cordovaSQLite.execute(db, 'SELECT agent_id, bank_id, branch_id FROM agent').then(function (res) {
        var count = res.rows.length;
        if (count > 0) {
            for (var i = 0; i < res.rows.length; i++) {
                $scope.agentID = (res.rows.item(0).agent_id);
                $scope.bankID = (res.rows.item(0).bank_id);
                $scope.branchID = (res.rows.item(0).branch_id);

            }
        }
    })


 


    $scope.clearCutomer = function () {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
       
        this.custAccType = '';
        this.custFName = '';
        this.custLName = '';
        this.custAddress = '';
        this.custMobileNo = '';
        this.custPanCard = '';
        this.custEmailId = '';
        this.InstallmentDays = '';
        this.Percentage = '';
        this.amount = '';
        $scope.loan = false;

        $timeout(function () {
            $ionicLoading.hide();
            $state.go('app.home');
        }, 1000);
    }

    $scope.reqCutomer = function () {
        $state.go('app.reqCustomer');
        $scope.search = '';
    }

    $scope.product = [];
    var productQuery = "SELECT Id,pDetails,pType from product";
    $cordovaSQLite.execute(db, productQuery, []).then(function (res) {
        console.log('Here Seeee======' + res);
        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
                $scope.product.push({
                    id: (res.rows.item(i).Id), des: (res.rows.item(i).pDetails), type: (res.rows.item(i).pType)
                });
                console.log($scope.product)
            }
        }
        else {
            console.log("No results found");
        }
    }, function (err) {
        console.error(err);
    });

    //GetAccount Type
    $scope.getAccountType = function () {
        if (this.custAccType == 'LOAN') {
            $scope.loan = true;
        } else {
            $scope.loan = false;
        }

        var productQuery = "SELECT Id,pDetails,pType from product where pType = '" + this.custAccType + "'";
        $cordovaSQLite.execute(db, productQuery, []).then(function (res) {
            $scope.trxType = res.rows.item(0).Id;
            

        }, function (err) {
            console.error(err);
        });
    }
  

    //Create Customer Code
    $scope.createCutomer = function () {
        //Search Running Sequence Number from local database to push in database 
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        if (this.custAccType == null) {
            
            $timeout(function () {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Select Account Type',
                    template: 'Please Select Account Type!'
                });
            }, 1000);
        } else if (this.custFName == null || this.custLName == null) {
            $timeout(function () {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Enter Full Name',
                    template: 'Please Enter Customer First & Last Name!'
                });
            }, 1000);
        }
        else if (this.custMobileNo == null) {
            
            $timeout(function () {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Enter Mobile No.',
                    template: 'Please Enter Valid 10 - DIGIT Mobile Numer!'
                });
            }, 1000);
        }

        else {
            var trxType = $scope.trxType;

            var agentID = $scope.agentID;
            var bankID = $scope.bankID;
            var branchID = $scope.branchID;

            //var latestSeqence_zero = ("000" + latestSeqPlus).slice(-3);
            //Get Current Date and Time
            $scope.ModifiedDate = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss');
            $scope.ModifiedDatee = $filter('date')(new Date(), 'HHMMss');

            var DateForToday = $scope.ModifiedDate;
            var TimeForToday = $scope.ModifiedDatee + 1;
            var custIDCreate = agentID + '' + TimeForToday;
            var external_cust_id = custIDCreate;

            var cust_id = custIDCreate;
            var cust_name = String(this.custFName + ' ' + this.custLName);
            var cust_local_add = String(this.custAddress);
            var cust_perm_add = '';
            var cust_phno_1 = String(this.custMobileNo);
            var cust_phno_2 = String(this.custMobileNo2);
            var cust_photo = '';
            var cust_pancard_no = this.custPanCard;
            var cust_email_id = this.custEmailId;
            var login_id = '';
            var role_id = '';
            var agent_id = agentID;
            var status = 0;
            var is_sync = 'false';
            var sync_dt = String($scope.ModifiedDate);
            var bank_sync_dt = '';
            var bank_id = bankID;
            var external_account_id = this.custAccType + '/' + custIDCreate;
            var accType = this.custAccType;
            var Percentage = this.Percentage;
            var InstallmentDays = this.InstallmentDays;
            var amount = this.amount;

            var request = $http({
                method: "post",
                url: urlglobal+"/customers",
                crossDomain: true,
                data: {
                    external_cust_id: external_cust_id,
                    cust_name: cust_name,
                    cust_local_add: cust_local_add,
                    cust_phno_1: cust_phno_1,
                    cust_phno_2: cust_phno_2,
                    cust_pancard_no: cust_pancard_no,
                    cust_email_id: cust_email_id,
                    agent_id: agent_id,
                    status: status,
                    sync_dt: sync_dt,
                    bank_id: bank_id,
                    is_sync: is_sync,
                    bank_sync_dt: sync_dt,
                    InstallmentDays: InstallmentDays,
                    Percentage: Percentage
                },
                headers: { 'Content-Type': 'application/json' },

            }).success(function (data) {

                $http.get(urlglobal+"/customers" + "?$filter=external_cust_id eq '" + external_cust_id + "'").then(function (res) {

                    var role = res.data;
                    var users = role.value;
                    console.log(users[0].cust_id);
                    var getCustID = users[0].cust_id;


                    var request = $http({
                        method: "post",
                        url: urlglobal+"/accounts",
                        crossDomain: true,
                        data: {
                            external_account_id: external_account_id,
                            //acc_id: custIDCreate,
                            cust_id: getCustID,
                            balance: amount,
                            bank_id: bank_id,
                            branch_id: branchID,
                            agent_id: agent_id,
                            status: status,
                            sync_dt: sync_dt,
                            bank_sync_dt: sync_dt,
                            Account_Type: accType,
                            trx_type: trxType,
                            InstallmentDays: InstallmentDays,
                            Percentage: Percentage
                        },
                        headers: { 'Content-Type': 'application/json' },
                    }).success(function (data) {
                        $state.go('app.home');


                        var cust_queryy = "INSERT INTO customer (external_cust_id , cust_id , cust_name , cust_local_add , cust_perm_add , cust_phno_1 , cust_phno_2 , cust_photo , cust_pancard_no , cust_email_id , login_id , role_id , agent_id , status , is_sync , sync_dt , bank_sync_dt, bank_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                        var cust_acc_queryy = "INSERT INTO account (external_account_id , acc_id , cust_id , balance , bank_id , branch_id , agent_id , status , is_sync , sync_dt , bank_sync_dt, Account_Type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";


                        $cordovaSQLite.execute(db, cust_queryy, [external_cust_id, getCustID, cust_name, cust_local_add, cust_perm_add, cust_phno_1, cust_phno_2, cust_photo, cust_pancard_no,
                        cust_email_id, login_id, role_id, agent_id, status, is_sync, DateForToday, bank_sync_dt, bank_id]).then(function (res) {
                            console.log("INSERT ID test-> " + res.insertId);
                        }, function (err) {
                            console.log(err);
                        });


                        $cordovaSQLite.execute(db, cust_acc_queryy, [external_account_id, custIDCreate, getCustID, 0.0, bank_id, branchID, agent_id, status, is_sync, DateForToday, bank_sync_dt, accType]).then(function (res) {
                            console.log("INSERT ID test-> " + res.insertId);
                        }, function (err) {
                            console.log(err);
                        });

                        $timeout(function () {
                            $ionicLoading.hide();
                          

                            var alertPopup = $ionicPopup.alert({
                                title: 'Customer Created',
                                template: 'Customer Request is Received By Bank !'
                            });
                        }, 1000);
                        

                    }).error(function (err) {
                        $timeout(function () {
                            $ionicLoading.hide();
                           

                            var alertPopup = $ionicPopup.alert({
                                title: 'Account Create Faild',
                                template: 'Customer Created & Contact Bank To Create Account For Customer!'
                            });
                        }, 1000);
                    });



                });


            }).error(function (err) {
                $timeout(function () {
                    $ionicLoading.hide();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Internet Unavailable',
                        template: 'Please Connect With Internet!'
                    });
                }, 1000);
 

            });
             
           
        }
        this.custAccType = '';
        this.custFName = '';
        this.custLName = '';
        this.custAddress = '';
        this.custMobileNo = '';
        this.custPanCard = '';
        this.custEmailId = '';
        this.InstallmentDays = '';
        this.Percentage = '';
        this.amount = '';
        $scope.loan = false;
    }


    //Search customers from local database view on html page UNIQUE
    $scope.tasksq = [];
    var namec = $scope.tasksq;
    
    //var joinTable = "Select trx.cust_id custid, trx.external_trx_id trxExtId, trx.trx_dt trxdt, trx.amt amount, trx.trx_dt datetrx,
    //cust.cust_name nameCust, cust.external_cust_id extCustId, acc.external_account_id accid, agnt.agent_name agntname  from trx_details trx ,
    //customer cust, account acc, agent agnt where trx.cust_id = cust.cust_id AND cust.cust_id = acc.cust_id AND 
    //trx.agent_id = agnt.agent_id AND trx.trx_dt = ?";
    $scope.search = '';
    var query = "SELECT cust.cust_id custmId, cust.external_cust_id extcust, acc.external_account_id extaccno, cust.cust_name custName, acc.sync_dt syncdate, acc.acc_id acc_id, acc.status custAStatus,  cust.status custStatus, cust.cust_local_add custAdd, acc.Account_Type accType, acc.cust_id accCustID FROM customer cust, account acc where cust.cust_id = acc.cust_id AND cust.status = 0";
    $cordovaSQLite.execute(db, query, []).then(function (res) {

        if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {

                $scope.tasksq.push({
                    external_cust_id: (res.rows.item(i).extcust), cust_name: (res.rows.item(i).custName), cust_id: (parseInt(res.rows.item(i).custmId)), acc_id: (parseInt(res.rows.item(i).acc_id)),
                    cust_local_add: (res.rows.item(i).custAdd), Account_Type: (res.rows.item(i).accType), Account_No: (res.rows.item(i).extaccno),
                    statusCustomer: (res.rows.item(i).custStatus), statusACustomer: (res.rows.item(i).custAStatus), Syncdate: (res.rows.item(i).syncdate)
                });
                 
            }
        }

        else {
            console.log("No results found");
        }

    }, function (err) {
        console.error(err);
    });



    $scope.goRecords = function () {
        $scope.tasksq = [];
        $scope.search = '';
        var query = "SELECT cust.cust_id custmId, cust.external_cust_id extcust, acc.external_account_id extaccno, cust.cust_name custName, acc.sync_dt syncdate, acc.acc_id acc_id, acc.status custAStatus,  cust.status custStatus, cust.cust_local_add custAdd, acc.Account_Type accType, acc.cust_id accCustID FROM customer cust, account acc where cust.cust_id = acc.cust_id and cust.status = 0";
        $cordovaSQLite.execute(db, query, []).then(function (res) {
            console.log('Here Seeee======' + res.length);
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {

                    $scope.tasksq.push({
                        external_cust_id: (res.rows.item(i).extcust), cust_name: (res.rows.item(i).custName), cust_id: (parseInt(res.rows.item(i).custmId)), acc_id: (parseInt(res.rows.item(i).acc_id)),
                        cust_local_add: (res.rows.item(i).custAdd), Account_Type: (res.rows.item(i).accType), Account_No: (res.rows.item(i).extaccno),
                        statusCustomer: (res.rows.item(i).custStatus), statusACustomer: (res.rows.item(i).custAStatus), Syncdate: (res.rows.item(i).syncdate)
                    });


                }
            }

            else {
                console.log("No results found");
            }

        }, function (err) {
            console.error(err);
        });

    }



    $scope.status = function () {
        var id = this.id;
        $http.get(urlglobal + "/customers?$filter=external_cust_id eq '" + id + "'").then(function (res) {

            var role = res.data;
            var users = role.value;
            var uu1 = users[0].external_cust_id;
            var uu2 = users[0].cust_id;
            if (users[0].status == 1) {
                var updateCustAcc1 = "update customer set status=1, cust_id=? where external_cust_id=?";
                $cordovaSQLite.execute(db, updateCustAcc1, [uu2, uu1]).then(function (res) {
                    console.log('Here Seeee======' + res);
                })

                $http.get(urlglobal + "/accounts?$filter=cust_id eq '" + uu2 + "'").then(function (res) {

                    var role = res.data;
                    var users = role.value;
                    var accId = users[0].acc_id;
                    var custId = users[0].cust_id;

                    var updateCustAcc2 = "update account set status=1, cust_id=? where cust_id=?";
                    $cordovaSQLite.execute(db, updateCustAcc2, [accId, custId]).then(function (res) {
                        console.log('Here Seeee======' + res);
                    })
                })

               

                alert('Customers Account Approved From Bank');
                $scope.goRecords();

            } else {
                alert('Customer Account Not Yet Approved');
            };


        }, function (err) {
            alert('Please Connect with Internet');
        });

        var query = "SELECT distinct(cust.cust_id) custmId, cust.external_cust_id extcust, acc.external_account_id custaccNo , acc.external_account_id extaccno, cust.cust_name custName, acc.status custAStatus, cust.status custStatus, cust.cust_local_add custAdd, acc.Account_Type accType, acc.cust_id accCustID, acc.acc_id accID FROM customer cust, account acc where cust.cust_id = acc.cust_id AND cust.is_sync='true' AND acc.Account_Type= '" + $scope.exact_user + "'";
        $cordovaSQLite.execute(db, query, []).then(function (res) {
            $scope.tasks = [];

            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    $scope.tasks.push({
                        external_cust_id: (res.rows.item(i).extcust), cust_name: (res.rows.item(i).custName), cust_id: (parseInt(res.rows.item(i).custmId)),
                        cust_local_add: (res.rows.item(i).custAdd), Account_Type: (res.rows.item(i).accType), Account_No: (res.rows.item(i).extaccno),
                        statusCustomer: (res.rows.item(i).custStatus), statusACustomer: (res.rows.item(i).custAStatus), acc_id: (res.rows.item(i).accID)
                    });
                }
            }
            else {
            }
        }, function (err) {
            console.error(err);
        });
    }
    
})




bank.controller("ExampleController", function ($scope, $cordovaCamera) {

    $scope.takePicture = function () {
        var options = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
        }, function (err) {
            // An error occured. Show a message to the user
        });
    }

})





bank.controller('AppCtrl', function ($scope, $ionicHistory, $ionicModal, $timeout, $filter, $state, $http, $cordovaSQLite) {
    //http TIMEOUT
    $ionicHistory.nextViewOptions({
        disableAnimate: false,
        disableBack: true
    });
    //Logout Control
    $scope.logout = function () {

        $cordovaSQLite.execute(db, "SELECT * from agent").then(function (result) {
            if (result.rows.length == 0) {
                $state.go('login');

            } else {
                $state.go('alogin');
            }
        }, function (error) {
            console.error(error);
        });

        history.go(0);
    };


    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    //$ionicModal.fromTemplateUrl('templates/login.html', {
    //  scope: $scope
    //}).then(function(modal) {
    //  $scope.modal = modal;
    //});
    $scope.statuses = '';


    // Triggered in the login modal to close it
    $scope.searchCustomers = function () {
        $rootScope.$viewHistory.backView = null;
        $ionicHistory.clearHistory().go('app.search');


    };

    $scope.goHome = function () {

        $state.go('app.home');

    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };


    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeLogin();
        }, 1000);
    };
})
