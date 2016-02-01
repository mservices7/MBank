// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

.run(function ($ionicPlatform,$rootScope, $ionicLoading,$ionicPopup,$cordovaFile, $ionicHistory, $timeout, $cordovaSQLite, $state, $interval, $http, $filter) {
    
    $ionicPlatform.ready(function () {
        
       
      

        $interval(function () {

            var query = "SELECT external_trx_id , trx_id, bank_id, branch_id, cust_id, acc_id, agent_id, amt, trx_dt, trx_type, status, is_sync, sync_dt, bank_sync_dt FROM trx_details";
            $cordovaSQLite.execute(db, query, []).then(function (res, statuses) {

                if (res.rows.length > 0) {

                    for (var i = 0; i < res.rows.length; i++) {

                        //Hold Value In $scope
                        var external_trx_id = String(res.rows.item(i).external_trx_id);
                        var trx_id = String(res.rows.item(i).trx_id);
                        var bank_id = res.rows.item(i).bank_id;
                        var branch_id = res.rows.item(i).branch_id;
                        var cust_id = res.rows.item(i).cust_id;
                        var acc_id = res.rows.item(i).acc_id;
                        var agent_id = res.rows.item(i).agent_id;
                        var amt = res.rows.item(i).amt;
                        var trx_dt = String(res.rows.item(i).trx_dt);
                        var trx_type = String(res.rows.item(i).trx_type);
                        var status = 2;
                        var is_sync = String(res.rows.item(i).is_sync);
                        var sync_dt = String(res.rows.item(i).sync_dt);
                        var bank_sync_dt = String(res.rows.item(i).bank_sync_dt);
                        var dateInsert = $filter('date')(new Date(), 'dd-MM-yyyy hh:mm:ss');



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
                                bank_sync_dt: dateInsert,
                                InterestAmount: res.rows.item(i).InterestAmount,
                                NumberOfDays:res.rows.item(i).NumberOfDays


                            },
                            headers: { 'Content-Type': 'application/json' },

                        }).success(function (data) {console.log('Data Uploaded');
                        }, function (err) {console.error('Error= = ' + err);});}
                } else {console.log("No results found");}})}, 120000);




        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard && window.plugins.sqlDB.copy) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

            
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        

        //Code for Creating Table( Local Database )
        if (window.cordova && window.plugins.sqlDB.copy) {
            // App syntax
            console.log('dBexist');
            db = $cordovaSQLite.openDB("mBank.db");

           
            function onDeviceReady() {
                console.log(">device is ready");
                window.plugins.sqlDB.copy("mBank.db", 1, copysuccess, copyerror);
            }
            function copysuccess() {
                //open db and run your queries
                db = window.sqlitePlugin.openDatabase({ name: "mBank.db" });
            }

            function copyerror(e) {
                //db already exists or problem in copying the db file. Check the Log.
                console.log("Error Code = " + JSON.stringify(e));
                //e.code = 516 => if db exists
            }
        } else {
            // Ionic serve syntax
            console.log('no db');
            db = window.openDatabase("mBank.db", "1.0", "mBank DB", 1024 * 1024 * 100);
        }

        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS agent (external_login_id text , agent_id real primary key, agent_name real, agent_phno_1 real, agent_phno_2 real, agent_email_id real, agent_local_add real,agent_perm_add real, agent_photo real, bank_id int, bank_sync_dt real, branch_id int, external_agent_id real, is_sync real, login_id real, role_id real, status real, sync_dt real)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS user_details (external_login_id text primary key, login_id real, pwd real, role_id real, status real, is_sync real,sync_dt real, bank_sync_dt real)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS bank (external_bank_id text primary key, bank_id real, bank_name real, bank_add real, bank_phno_1 real, bank_phno_2 real, status real, is_sync real, sync_dt real, bank_sync_dt real)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS branch (external_branch_id text primary key, branch_id real, branch_name real, bank_id real, branch_add real, branch_phno_1 real, branch_phno_2 real, status real, is_sync real, sync_dt real, bank_sync_dt real)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS account (external_account_id text , acc_id number primary key, cust_id real, balance real, bank_id real, branch_id real, agent_id real, status real, is_sync real, sync_dt real, bank_sync_dt real, Account_Type real, trx_type int, InstallmentDays number, Percentage number)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS customer (external_cust_id  text , cust_id number primary key, cust_name real, cust_local_add real, cust_perm_add real, cust_phno_1 real, cust_phno_2 real, cust_photo real, cust_pancard_no real, cust_email_id real, login_id real, role_id real, agent_id real, status real, is_sync real, sync_dt real, bank_sync_dt real, bank_id real,InstallmentDays number,Percentage number)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS role_details (external_roll_id text primary key, role_id real, role_type real, Agent real, status real, is_sync real, sync_dt real, bank_sync_dt real)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS trx_details (external_trx_id text , trx_id text primary key, bank_id text, branch_id text, cust_id text, acc_id text, agent_id text, amt int, trx_dt text, trx_type text, status text, is_sync text, sync_dt real, bank_sync_dt real,InterestAmount number,NumberOfDays number)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS trx_status_details (trx_status real, details real)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS running_seq (running_seq_no integer, loginStatus integer,urlBank text)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS product (Id integer primary key, pDetails text, pType text)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS trxn_views (external_account_id text , trx_data int, agent_name text, trxId int primary key, external_trx_id text, trx_id text, bank_id int, brach_id int, cust_id text, acc_id int, agent_id int,amt int,trx_dt text,trx_type txt,status int,is_sync text,trx_balance real,sync_dt text,bank_sync_dt text,external_cust_id text,cust_name text,external_agent_id text,InterestAmounts int,NumberOfDay int)");
         

        $cordovaSQLite.execute(db, "SELECT * from running_seq").then(function (result) {
            if (result.rows.length == 0) {
                var query = "INSERT INTO running_seq (running_seq_no, loginStatus) VALUES (?,?)";
                $cordovaSQLite.execute(db, query, [0,0]).then(function(res){ 
                });

            } else { console.log('Error = ' + result); }
        }, function (error) { console.error(error); });



    

        $ionicHistory.clearHistory();
        $rootScope.user = null;
        $cordovaSQLite.execute(db, "SELECT * from agent").then(function (result) {

            switch (result.rows.length) {
                case 0:
                    $ionicHistory.clearHistory(); 
                    $state.go('login');
                    $rootScope.user = null;
                    console.log('$rootScope.user = ' + $rootScope.user);
                    break;
                default:
                    var queryls = "SELECT loginStatus FROM running_seq";

                    $cordovaSQLite.execute(db, queryls, []).then(function (res) {
                        switch (res.rows.item(0).loginStatus) {
                            case 0:
                                $state.go('alogin');
                                $rootScope.user = null;
                                console.log('$rootScope.user = ' + $rootScope.user);
                                break;

                            case 3:
                                $state.go('app.home'); 
                                $rootScope.user = 'agent';
                                console.log('$rootScope.user = ' + $rootScope.user);
                                break;
                        }

                    })


                 
            }
 

        }, function (error) { console.error(error); });



    });
})

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
          url: '/app',
          abstract: true,
          templateUrl: 'templates/menu.html',
          controller: 'menuCtrl'
      })

 .state('appBM', {
     url: '/appBM',
     abstract: true,
     templateUrl: 'templates/menuBM.html',
     controller: 'menuCtrl'
 })

  //Login Details With Bank Manager
    .state('login', {
        url: '/login',
        templateUrl: 'templates/BMlogin.html',
        controller: 'LogCtrl'
    })

  //Login With Agent
    .state('alogin', {
        url: '/alogin',
        templateUrl: 'templates/AGNTlogin.html',
        controller: 'LogCtrl'
    })

  //Agent Home
    .state('app.home', {
        url: '/home',
        views: {
            'menuContent': {
                templateUrl: 'templates/home.html',
                controller: "UserFetchCtrl"
            }
        }
    })

// Branch Manager Home
 .state('appBM.bmhome', {
     url: '/bmhome/:bm_id',
     views: {
         'menuContent': {
             templateUrl: 'templates/BM-home.html',
             controller: "UserCtrl"
         }
     }
 })

  //Assign Agent
    .state('appBM.assignAgent', {
        url: "/assignAgent/:bm_id",
        views: {
            'menuContent': {
                templateUrl: "templates/AsgnAgent.html",
                controller: 'UserCtrl'
            }
        }
    })

  //Assign Agent Route
          .state('appBM.AsgnAgent_2', {
              url: "/AsgnAgent_2/:bm_id/:user_id",
              views: {
                  'menuContent': {
                      templateUrl: "templates/AsgnAgent_2.html",
                      controller: "UserCtrl"
                  }
              }
          })


  //Created Agent Redirect
    .state('createdAgent', {
        url: "/createdAgent/:bm_id",
         
                templateUrl: "templates/AgentCreated.html",
                controller: 'UserCtrl'
            
        
    })

  //Search Customers
    .state('app.search', {
        url: '/search/:user_id',
        views: {
            'menuContent': {
                templateUrl: 'templates/search.html',
                controller: "UserFetchCtrl"
            }
        }
    })

  //Redirect Customers Details
    .state('app.detail', {
        url: "/searchdetails/:user_id/:user_info",
        views: {
            'menuContent': {
                templateUrl: "templates/detail_2.html",
                controller: "UserFetchCtrl"
            }
        }
    })

      .state('app.detail_2', {
          url: "/detail_2/:user_id/:user_info",
          views: {
              'menuContent': {
                  templateUrl: "templates/detail_2.html",
                  controller: "UserFetchCtrl"
              }
          }
      })

  .state('app.records', {
      url: "/records",
      views: {
          'menuContent': {
              templateUrl: "templates/Records.html",
              controller: "recordCtrl"
          }
      }
  })

  .state('app.syncrecords', {
      url: "/syncrecords",
      views: {
          'menuContent': {
              templateUrl: "templates/Records/Synced_Record.html",
              controller: "recordCtrl"
          }
      }
  })
      .state('app.approverecords', {
          url: "/approverecords",
          views: {
              'menuContent': {
                  templateUrl: "templates/Records/Approved_Record.html",
                  controller: "recordCtrl"
              }
          }
      })

   .state('app.failedrecords', {
       url: "/failedrecords",
       views: {
           'menuContent': {
               templateUrl: "templates/Records/Synced_Faild.html",
               controller: "recordCtrl"
           }
       }
   })

     .state('app.cameraWork', {
         url: "/cameraWork",
         views: {
             'menuContent': {
                 templateUrl: "templates/Records/cameraWork.html"
             }
         }
     })

    .state('app.CreateCustAcc', {
        url: "/CreateCustAcc",
        views: {
            'menuContent': {
                templateUrl: "templates/Records/CreateCustAcc.html",
                controller: "CreateCustAcc"
            }
        }
    })

.state('app.reqCustomer', {
    url: "/reqCustomer",
    views: {
        'menuContent': {
            templateUrl: "templates/Records/reqCustomer.html",
            controller: "CreateCustAcc"
        }
    }
})


    //$urlRouterProvider.otherwise('/app/home');
});



//.state('app.browse', {
//    url: '/browse',
//    views: {
//      'menuContent': {
//        templateUrl: 'templates/browse.html'
//      }
//    }
//  })
//  .state('app.playlists', {
//    url: '/playlists',
//    views: {
//      'menuContent': {
//        templateUrl: 'templates/playlists.html',
//        controller: 'PlaylistsCtrl'
//      }
//    }
//  })

//.state('app.single', {
//  url: '/playlists/:playlistId',
//  views: {
//    'menuContent': {
//      templateUrl: 'templates/playlist.html',
//      controller: 'PlaylistCtrl'
//    }
//  }
//});
// if none of the above states are matched, use this as the fallback
//{"external_account_id":"DRD/000341",
//    "acc_id":334,
//    "bank_id":1,
//    "branch_id":1,
//    "account_type":null,
//    "external_cust_id":"11",
//    "cust_id":1,
//    "cust_name":"sauQaakr icarkuT h{ovaar",
//    "cust_local_add":"Aamagaava (id.) BaMDara",
//    "cust_perm_add":"",
//    "cust_phno_1":"",
//    "cust_phno_2":"",
//    "cust_email_id":"",
//    "agent_id":18
//}


//var seq_query = "SELECT status from running_seq";
//$cordovaSQLite.execute(db, seq_query, []).then(function (res) {
//    var count = res.rows.length;
//    if (count > 0) {
//        for (var i = 0; i < res.rows.length; i++) {
//            var statuss = (res.rows.item(i).status);

//            if (statuss === 0) {
//                $ionicHistory.clearHistory();

//                $state.go('app.assignAgent');
//            } else if (statuss === 'NO') {
//                $ionicHistory.clearHistory();
//                var seq_query = "update running_seq set status = ?";
//                $cordovaSQLite.execute(db, seq_query, ['NO']).then(function (res) {
//                    console.log('status=no');
//                });
//                $state.go('alogin');

//            } else if (statuss === 'YES') {
//                $ionicHistory.clearHistory();
//                $state.go('app.home');
//            }
//        }
//    }
//})
