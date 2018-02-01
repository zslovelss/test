angular.module("baseConfig", [])
.constant("baseConfig", {"debug":false,"baseUrl":"http://116.90.82.41:8080/hec_app","workflow_all":"0","workflow_todo":"1","workflow_done":"2","workflow_apply":"3","approve":"1","refuse":"-1","toOther":"0","goBack":"2","addBeforeApprover":"4","addAfterApprover":"5","pageCount":5,"historyDisplayMode":{"isFixedTop":false,"isOpenModal":true},"multipleLinesDisplayMode":{"isPageUpDown":false,"isSlideList":true}});

var utilModule = angular.module('utilModule', []);
var HmsModule = angular.module('HmsModule', []);
var workflowModule = angular.module('workflowModule', []);
var loginModule = angular.module('loginModule', []);
var homeModule = angular.module('homeModule', []);
var hecModule =  angular.module('hecModule', []);
var settingModule = angular.module('settingModule', []);
var serverPathModule = angular.module('serverPathModule', []);
var JPushServiceModule = angular.module('JPushServiceModule', []);

/**
 * Created by Winward on 2017/9/12.
 */
/**
 * @hec-img-zoom
 */
hecModule.directive('hecimgzoom', [function () {
  return {
    restrict: 'A',
    scope    : false,
    link     :  function (scope, element, attrs) {
      var elWidth, elHeight;

      // mode : 'pinch' or 'swipe'
      var mode = '';

      // distance between two touche points (mode : 'pinch')
      var distance = 0;
      var initialDistance = 0;

      // image scaling
      var scale = 1;
      var relativeScale = 1;
      var initialScale = 1;
      var maxScale = parseInt(attrs.maxScale, 10);
      if (isNaN(maxScale) || maxScale <= 1) {
        maxScale = 3;
      }

      // position of the upper left corner of the element
      var positionX = 0;
      var positionY = 0;

      var initialPositionX = 0;
      var initialPositionY = 0;

      // central origin (mode : 'pinch')
      var originX = 0;
      var originY = 0;

      // start coordinate and amount of movement (mode : 'swipe')
      var startX = 0;
      var startY = 0;
      var moveX = 0;
      var moveY = 0;

      var image = new Image();
      image.onload = function() {
        elWidth = element[0].clientWidth;
        elHeight = element[0].clientHeight;

        element.css({
          '-webkit-transform-origin' : '0 0',
          'transform-origin'         : '0 0'
        });

        element.on('touchstart', touchstartHandler);
        element.on('touchmove', touchmoveHandler);
        element.on('touchend', touchendHandler);
      };

      if (attrs.ngSrc) {
        image.src = attrs.ngSrc;
      } else {
        image.src = attrs.src;
      }

      /**
       * @param {object} evt
       */
      function touchstartHandler(evt) {
        var touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;

        startX = touches[0].clientX;
        startY = touches[0].clientY;
        initialPositionX = positionX;
        initialPositionY = positionY;
        moveX = 0;
        moveY = 0;
      }

      /**
       * @param {object} evt
       */
      function touchmoveHandler(evt) {
        var touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;

        if (mode === '') {
          if (touches.length === 1 && scale > 1) {

            mode = 'swipe';

          } else if (touches.length === 2) {

            mode = 'pinch';

            initialScale = scale;
            initialDistance = getDistance(touches);
            originX = touches[0].clientX -
              parseInt((touches[0].clientX - touches[1].clientX) / 2, 10) -
              element[0].offsetLeft - initialPositionX;
            originY = touches[0].clientY -
              parseInt((touches[0].clientY - touches[1].clientY) / 2, 10) -
              element[0].offsetTop - initialPositionY;

          }
        }

        if (mode === 'swipe') {
          evt.preventDefault();

          moveX = touches[0].clientX - startX;
          moveY = touches[0].clientY - startY;

          positionX = initialPositionX + moveX;
          positionY = initialPositionY + moveY;

          transformElement();

        } else if (mode === 'pinch') {
          evt.preventDefault();

          distance = getDistance(touches);
          relativeScale = distance / initialDistance;
          scale = relativeScale * initialScale;

          positionX = originX * (1 - relativeScale) + initialPositionX + moveX;
          positionY = originY * (1 - relativeScale) + initialPositionY + moveY;

          transformElement();

        }
      }

      /**
       * @param {object} evt
       */
      function touchendHandler(evt) {
        var touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;

        if (mode === '' || touches.length > 0) {
          return;
        }

        if (scale < 1) {

          scale = 1;
          positionX = 0;
          positionY = 0;

        } else if (scale > maxScale) {

          scale = maxScale;
          relativeScale = scale / initialScale;
          positionX = originX * (1 - relativeScale) + initialPositionX + moveX;
          positionY = originY * (1 - relativeScale) + initialPositionY + moveY;

        } else {

          if (positionX > 0) {
            positionX = 0;
          } else if (positionX < elWidth * (1 - scale)) {
            positionX = elWidth * (1 - scale);
          }
          if (positionY > 0) {
            positionY = 0;
          } else if (positionY < elHeight * (1 - scale)) {
            positionY = elHeight * (1 - scale);
          }

        }

        transformElement(0.1);
        mode = '';
      }

      /**
       * @param {Array} touches
       * @return {number}
       */
      function getDistance(touches) {
        var d = Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) +
          Math.pow(touches[0].clientY - touches[1].clientY, 2));
        return parseInt(d, 10);
      }

      /**
       * @param {number} [duration]
       */
      function transformElement(duration) {
        var transition  = duration ? 'all cubic-bezier(0,0,.5,1) ' + duration + 's' : '';
        var matrixArray = [scale, 0, 0, scale, positionX, positionY];
        var matrix      = 'matrix(' + matrixArray.join(',') + ')';

        element.css({
          '-webkit-transition' : transition,
          transition           : transition,
          '-webkit-transform'  : matrix + ' translate3d(0,0,0)',
          transform            : matrix
        });
      }
    }
  };

}]);


homeModule.directive('hecNineBlock', [
	'$timeout',
	'$controller',
  'hmsHttp',
  '$http',
  'baseConfig',
  '$AuHttp',
	function($timeout, $controller,hmsHttp,$http,baseConfig,auHttp){
	return {
		restrict: 'E',
		scope: true,
		templateUrl: 'build/pages/home/hecNineBlock.html',
		compile: function (element){

			return {pre: preLink};

			function preLink($scope, $element, $attr){
        $scope.config = {
          delegateHandle: $attr.delegateHandle,
          baseUrl: $attr.baseUrl,
          nineDataRemoteUrl: $attr.nineDataRemoteUrl,
          nineDataRemote: [],
          nineDataLocal : $attr.nineDataLocal,
          fromRemote : $attr.fromRemote,
          nineBlockData: [],
          listData:[]
        };
				if(true){
					__getAndHandleNineDataFromRemote($scope);
				}else if($scope.config.nineDataLocal){
					$scope.config.nineBlockData = __handleNineBlockData($scope, $scope.config.nineDataLocal);
				};

        var nineBlockViewOptions = {
          el: angular.element($element[0]),
          delegateHandle: $attr.delegateHandle
        };

        $controller('$nineBlockCtrl', {
          $scope: $scope,
          nineBlockViewOptions: nineBlockViewOptions
        });

        $scope.refreshTipsCount = function(){
          console.log(' directive-hecNineBlock: refreshTipsCount');
          refreshTipCount($scope);
        };


      }

      // 获取九宫格基本数据
			function __getAndHandleNineDataFromRemote($scope){
        var baseUrl = baseConfig.baseUrl; //调用接口的基础路径
        var url = baseUrl + '/modules/hmap/wfl/hmap_wfl_todo_count.svc';
        var params = {
          approve_user_code: $scope.user_name
        };
        $http.get('funList.json').success(function (funListData) {
          var data = funListData.result.record;
          if(!data || !data.length || data.length == 0){
            return;
          }
          auHttp.request({
            url: url,
            para: params
          }).then(function (response) {
            countList = response.response.count_List;
            data = countNum(data,countList);
            angular.forEach(data,function (item,index) {
              if(item.fun_code == ''|| item.fun_name == '资金划拨'){
                data.splice(index,1);
              }
            });
            $scope.config.nineBlockData = data;
            angular.forEach($scope.config.nineBlockData,function (item,index) {
               if(item.fun_name == '资金划拨'|| item.fun_name == ''){
                 $scope.config.nineBlockData.splice(index,1);
               }
            });
            console.info($scope.config.nineBlockData.length);
            __handleNineBlockData($scope, $scope.config.nineBlockData);
            //console.info('九宫格展示666666666==>',angular.toJson($scope.config.nineBlockData));

          }, function (response) {
            alert(response.response);
          });

        });

			}

      // 九宫格布局数据操作
      function __handleNineBlockData($scope, dataRemoteOrLocal){
        var data = dataRemoteOrLocal;
        var newData = data;
        /*if(data.length > 12){
          newData = data.slice(0, 12);
        }else if(data.length <9){
          newData = data;
          for (var i = newData.length; i <= 8; i++) {
            newData[i] = {};
            //var a = $scope.config.nineBlockData;
          };
        }else if(data.length > 9 && data.length < 12){
          newData = data;
          for (var i = newData.length; i <= 11; i++) {
            newData[i] = {};
            //var a = $scope.config.nineBlockData;
          };
        }else if(data.length == 9 || data.length == 12){
          newData = data;
        }*/

        /*$scope.config.nineBlockData = [];
        var currentLine = -1, currentCell = -1;
        for (var i = 0; i < newData.length; i++) {
          currentCell++;
          if(i%3==0){
            currentCell = 0;
            currentLine++;
            $scope.config.nineBlockData[currentLine] = [];
          }
          $scope.config.nineBlockData[currentLine][currentCell]=newData[i];
        };*/
      };

      // 处理九宫格 每个图标的个数提示
			function countNum(funList,countList) {

        angular.forEach(funList,function (item) {
          for(var i = 0;i<countList.length;i++){
            if(Object.keys(countList[i])[0] === item.fun_type){
              var key = Object.keys(countList[i])[0];
              item.fun_count = countList[i][key];
            }
          }
        });
        return funList;
        }

      function refreshTipCount($scope) {
         __getAndHandleNineDataFromRemote($scope);
       }
    }
	};
}]);

'use strict';
/**
 * @description:loading tag
 *
 */
HmsModule.directive('hmsLoading', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'E',
    template: '<div class="pre-loader"></div>',
    replace: true, //使用模板替换原始标记
    transclude: false,    // 不复制原始HTML内容
    controller: ["$scope", function ($scope) {
    }],
    link: function (scope, element, attrs, controller) {
    }
  };
}]);



"use strict";
HmsModule.directive('hmsWorkflowList', function () {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    scope: {
      workflowStatus: '=workflowStatus',
      workflowName: '=workflowName',
      workflowTitle: '=workflowTitle',
      createUserIcon: '=createUserIcon',
      workflowTypeNameLabel: '=workflowTypeNameLabel',
      workflowTypeName: '=workflowTypeName',
      lastApproveUserNameLabel: '=lastApproveUserNameLabel',
      lastApproveUserName: '=lastApproveUserName',
      currentNodeLabel: '=currentNodeLabel',
      currentNode: '=currentNode',
      createUserNameLabel: '=createUserNameLabel',
      createUserName: '=createUserName',
      approveStatusNameLabel: '=approveStatusNameLabel',
      approveStatusName: '=approveStatusName',
      approveDateLabel: '=approveDateLabel',
      approveDate: '=approveDate',
      commentTextLabel: '=commentTextLabel',
      commentText: '=commentText',
      chartStatusNameLabel: '=chartStatusNameLabel',
      chartStatusName: '=chartStatusName',
      isTodo: '=isTodo',
      isDone: '=isDone',
      isApply: '=isApply',
      isSelectedImg: '=isSelectedImg',
      operable: '=operable',
      instanceDescLabel: '=instanceDescLabel',
      instanceDesc: '=instanceDesc',
      instanceAmountLabel: '=instanceAmountLabel',
      instanceAmount: '=instanceAmount',
      insDocNumLabel:'=insDocNumLabel',
      insDocNum: '=insDocNum'
    },
    template: '<a class="workflow-list-item">' +
    '<div class="workflow-list-logo">' +
    '<img ng-src="{{createUserIcon}}"/>' +
    '</div>' +
    '<div class="workflow-list-header">{{isTodo||isDone?createUserName:workflowName}}</div>' +
    '<div class="workflow-list-content">' +
    '  <img class="select-img" ng-if="isTodo && !operable" ng-src={{"./build/img/workflow/"+isSelectedImg}}>' +
    '  <div class="row no-padding content-detail">' +
    '    <div class="col col-90 no-padding" ng-if="isTodo">' +
    '      <div class="row no-padding">' +
    '        <div class="col col-33 no-padding color-type">{{instanceDescLabel}}</div>' +
    '        <div class="col col-67 no-padding color-content">{{instanceDesc}}</div>' +
    '      </div>' +
    '      <div class="row no-padding">' +
    '        <div class="col col-33 no-padding color-type">{{instanceAmountLabel}}</div>' +
    '        <div class="col col-67 no-padding color-content">{{instanceAmount}}</div>' +
    '      </div>' +
    '    </div>' +
    '    <div class="col col-90 no-padding" ng-if="isDone ">' +
    '      <div class="row no-padding">' +
    '        <div class="col col-33 no-padding color-type">{{instanceDescLabel}}</div>' +
    '        <div class="col col-67 no-padding color-content">{{instanceDesc}}</div>' +
    '      </div>' +
    '      <div class="row no-padding">' +
    '        <div class="col col-33 no-padding color-type">{{instanceAmountLabel}}</div>' +
    '        <div class="col col-67 no-padding color-content">{{instanceAmount}}</div>' +
    '      </div>' +
    '      <div class="row no-padding">' +
    '        <div class="col col-33 no-padding color-type">{{approveStatusNameLabel}}</div>' +
    '        <div class="col col-67 no-padding color-content">{{approveStatusName}}</div>' +
    '      </div>' +
    '      <div class="row no-padding">' +
    '        <div class="col col-33 no-padding color-type">{{approveDateLabel}}</div>' +
    '        <div class="col col-67 no-padding color-content">{{approveDate}}</div>' +
    '      </div>' +
    '      <div class="row no-padding">' +
    '        <div class="col col-33 no-padding color-type">{{commentTextLabel}}</div>' +
    '        <div class="col col-67 no-padding color-content">{{commentText}}</div>' +
    '      </div>' +
    '    </div>' +
    '    <div class="col col-90 no-padding" ng-if="isApply">' +
    '      <div class="row no-padding">' +
    '        <div class="col col-33 no-padding color-type">{{insDocNumLabel}}</div>' +
    '        <div class="col col-67 no-padding color-content">{{insDocNum}}</div>' +
    '      </div>' +
    '      <div class="row no-padding">' +
    '        <div class="col col-33 no-padding color-type">{{instanceAmountLabel}}</div>' +
    '        <div class="col col-67 no-padding color-content">{{instanceAmount}}</div>' +
    '      </div>' +
    '    </div>' +
    '    <div class="col col-10 no-padding col-center workflow-list-select">' +
    '      <img src="build/img/workflow/select@3x.png"/>' +
    '    </div>' +
    '  </div>' +
    '</div></a>',
    controller: ["$scope", function ($scope) {
    }],
    link: function (scope, element, attrs) {

    }
  }
});

HmsModule.service('$AuHttp', ['$http', '$q', '$filter', '$ionicPopup', function ($http, $q, $filter, $ionicPopup) {
    return {
        request: request
    }
    function request(opt) {
        var delay = $q.defer();
        //alert(JSON.stringify(opt));
        $http.post(
            opt.url,
            "_request_data=" + encodeURIComponent( $filter('json')({parameter: opt.para}) ),
            {headers: {"Content-Type": "application/x-www-form-urlencoded"}}
        )
        .success(function (data, status, headers, config) {
            var resultData = null;
            var statusFlag = typeof(data.status) === 'undefined'?false:true;
            //status存在
            if(statusFlag){
              var errorcodeFlag = typeof(data.status.errorcode) === 'undefined'?false:true;
              //errorcode存在
              if(errorcodeFlag){
                if (data.status.errorcode === '0') {
                  if (data && data.workflow_list) {
                    if (data.workflow_list.length) {
                      resultData = data.workflow_list;
                    } else {
                      resultData = [];
                      resultData.push(data.workflow_list);
                    }
                  }
                  delay.resolve({
                    data: resultData,
                    status: status,
                    headers: headers,
                    config: config,
                    response: data
                  });
                }
                else {
                  var msgBox;
                  if(angular.isString(data)&&data.indexOf('login')>=0){
                    msgBox = $ionicPopup.alert({
                      title: '错误',
                      template: 'session超时'
                    });
                  }else{
                    msgBox = $ionicPopup.alert({
                      title: '错误',
                      template: data.status.errormsg
                    });
                  };

                  delay.reject({
                    data: resultData,
                    status: status,
                    headers: headers,
                    config: config,
                    response: data,
                    msgBox: msgBox
                  });
                }
              }
              //errorcode不存在
              else{
                if(!data.success){
                  msgBox = $ionicPopup.alert({
                    title: '错误',
                    template: data.error.message
                  });
                  delay.reject({
                    data: resultData,
                    status: status,
                    headers: headers,
                    config: config,
                    response: data,
                    msgBox: msgBox
                  });
                }
              }
            }
            //status不存在
            else{
              if(!data.success){
                msgBox = $ionicPopup.alert({
                  title: '错误',
                  template: data.error.message
                });
                delay.reject({
                  data: resultData,
                  status: status,
                  headers: headers,
                  config: config,
                  response: data,
                  msgBox: msgBox
                });
              }
            }

        })
        .error(function (data, status, headers, config) {
            //alert(status+" --- "+JSON.stringify(headers)+" --- "+JSON.stringify(config));
            var msgBox = $ionicPopup.alert({
                title: '错误',
                template: '请求失败,请检查网络设置或重试'
            });


            /*console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);*/

            delay.reject({
                data: data,
                status: status,
                headers: headers,
                config: config,
                resp: data,
                msgBox: msgBox
            });
        });
        return delay.promise;
    }
}]);

/*
* create by Winward at 2017-09-30
*
*功能：指纹登录
*
* 使用方法：
* 1.本地保存isOpenFingerLogin变量作为判断是否开启指纹登录的标识
* 2.登录成功后将用户名，密码加密保存到本地
* 3.根据当前登录的用户名和本地已有的用户名比较，判断是否为新用户
* 4.如果是新用户，登录成功后提示是否开启指纹登陆，如果开启，设置isOpenFingerLogin
* 5.如果不是新用户，判断是否已经开启指纹登录，如果开启了，弹出指纹验证
* 6.可以以修改本地isOpenFingerLogin变量的方法来控制是否开启指纹登陆
* 7.在进入登录界面后调用指纹登陆方法fingerLogin()，延时2s
*
*
* */

hecModule.service("$hecFingerLogin",["$hecUtil","$ionicPopup","$q",function (hecUtil,$ionicPopup,$q) {
  var isSupportFinger = false;
  var deferred1 = null;
  var deferred2 = null;
  var deferred3 = null;
  return {
    fingerLogin:fingerLogin,
    isFirstTimeLogin:isFirstTimeLogin,
    loginSuccessAction:loginSuccessAction,
    openFingerLogin:openFingerLogin
  };

  //指纹登录
  function fingerLogin() {
    deferred1 = $q.defer();
    //判断当前设备是否支持指纹登录
    window.plugins.touchid.isAvailable(
      //支持指纹
      function() {
        isSupportFinger = true;
        //判断是否开启了指纹登录
        if(window.localStorage.isOpenFingerLogin){
          window.plugins.touchid.verifyFingerprint(
            'Scan your fingerprint please', // this will be shown in the native scanner popup
            function() {
              deferred1.resolve();
            },
            function() {
              deferred1.reject();
              //手动登录
            })
        }else{
          deferred1.reject();
        }
      }
      //不支持指纹
      ,function() {
        isSupportFinger = false;
        deferred1.reject();
      }
    );
    return deferred1.promise;
  };

  //判断是否为首次登录
  function isFirstTimeLogin(name) {
    if(window.localStorage.userName){
      if(hecUtil.uncompileStr(window.localStorage.userName) != name){
        return true;
      }else{
        return false;
      }
    }else{
      return true;
    }
  }

  //登录成功行为
  function loginSuccessAction(name,password) {
    deferred2 = $q.defer();
    //判断是否为首次登录,加密用户名密码保存到本地,并清除之前开启指纹登录的开关
    if(isFirstTimeLogin(name)){
      window.localStorage.removeItem("isOpenFingerLogin");
      window.localStorage.userName = hecUtil.compileStr(name);
      window.localStorage.userPassword = hecUtil.compileStr(password);
      if(isSupportFinger){
        var myPopup = $ionicPopup.show({
          template: '<div></div>',
          title: '登录成功',
          subTitle: '是否开启指纹登录',
          buttons: [
            { text: '稍后' ,
              onTap: function() {
                myPopup.close();
              }},
            {
              text: '<b>启用</b>',
              type: 'button-positive',
              onTap: openFingerLogin
            }
          ]
        });
      }else{
      }
    }else{
    }
    deferred2.resolve();
    return deferred2.promise;
  }

  //开启指纹登陆
  function openFingerLogin() {
    deferred3 = $q.defer();
    window.plugins.touchid.isAvailable(function () {
      window.plugins.touchid.verifyFingerprint(
        'Scan your fingerprint please',
        function() {
          window.localStorage.isOpenFingerLogin = true;
          deferred3.resolve();
        },function () {
          window.localStorage.removeItem("isOpenFingerLogin");
          deferred3.reject();
        }
      );
    },function () {
      window.localStorage.removeItem("isOpenFingerLogin");
      var alertPopup = $ionicPopup.alert({
        title: '提示',
        template: '您的设备暂不支持指纹登录!'
      });
      alertPopup.then(function() {
        deferred3.reject();
      });
    });
    return deferred3.promise;
  }
}]);

/**
 * Created by LJh on 2017/4/13.
 */
JPushServiceModule
  .factory('jPushService', function ($rootScope) {
    var jpushServiceFactory = {};

    //启动极光推送
    var _init = function (config) {
      window.plugins.jPushPlugin.init();
      /*
       * 设置tag和Alias触发事件处理
       * */
      document.addEventListener('jpush.setAlias', config.stac, false);
      document.addEventListener("jpush.openNotification", onOpenNotification, false);
      /*
       * 打开推送消息事件处理
       * */
       /*$window.plugins.jPushPlugin.openNotificationInAndroidCallback = config.oniac;
       $window.plugins.jPushPlugin.receiveNotificationIniOSCallback = config.onios;*/
      window.plugins.jPushPlugin.setDebugMode(true);
    };
    var onOpenNotification = function (event) {
      try {
        if(ionic.Platform.isIOS()){
          window.plugins.jPushPlugin.resetBadge();
        }
        console.log(angular.toJson(event, true));
        // publicMethod.goView('my-message');
        $rootScope.$apply();
      } catch (exception) {
      }
    };
    /*
     * 获取状态
     * */
    var _isPushStopped = function (fun) {
      window.plugins.jPushPlugin.isPushStopped(fun);
    };
    /*
     * 停止极光推送
     * */
    var _stopPush = function () {
      window.plugins.jPushPlugin.stopPush();
    };
    /*
     * 重启极光推送
     * */
    var _resumePush = function () {
      window.plugins.jPushPlugin.resumePush();
    };
    /*
     * 设置标签和别名
     * */
    var _setTagsWithAlias = function (tags, alias) {
      window.plugins.jPushPlugin.setTagsWithAlias(tags, alias);
    };
    /*
     * 设置标签
     * */
    var _setTags = function (tags) {
      window.plugins.jPushPlugin.setTags(tags);
    };
    /*
     * 设置别名
     * */
    var _setAlias = function (alias) {
      window.plugins.jPushPlugin.setAlias(alias);
    };
    /*
     * 清除角标
     * */
    var _resetBadge = function () {
      window.plugins.jPushPlugin.resetBadge();
    };

    jpushServiceFactory.init = _init;
    jpushServiceFactory.isPushStopped = _isPushStopped;
    jpushServiceFactory.stopPush = _stopPush;
    jpushServiceFactory.resumePush = _resumePush;
    jpushServiceFactory.setTagsWithAlias = _setTagsWithAlias;
    jpushServiceFactory.setTags = _setTags;
    jpushServiceFactory.setAlias = _setAlias;
    jpushServiceFactory.resetBadge = _resetBadge;

    return jpushServiceFactory;
  });

/**
 * Created by Aspire on 2016/9/1.
 */
HmsModule
  .factory('hmsHttp', [
    '$http',
    function ($http) {
      var self = {};
      self.post = function (url, data) {
        return $http.post(url, data);
      };
      self.get = function (url) {
        return $http.get(url);
      };
      return self;
    }])
  .factory('hmsPopup', [
    '$ionicLoading',
    '$ionicPopup',
    function ($ionicLoading, $ionicPopup) {
      var self = {};
      self.showLoading = function (content) {
        $ionicLoading.show({
          template: '<ion-spinner icon="ios" class="spinner spinner-ios spinner-stable"></ion-spinner>' +
          '<div style="color: white;font-size: 12px;text-align: center;">' + content + '</div>'
        });
      };
      self.showLoadingNoBackdrop = function (content) {
        $ionicLoading.show({
          template: '<ion-spinner icon="ios" class="spinner spinner-ios spinner-stable"></ion-spinner>' +
          '<div style="color: white;font-size: 12px;text-align: center;">' + content + '</div>',
          noBackdrop: true
        });
      };
      self.hideLoading = function () {
        $ionicLoading.hide();
      };
      self.showToast = function (content) {//长时间底部提示toast
        $ionicLoading.show({
          template: (angular.isDefined(content) ? content : '操作失败'),
          animation: 'fade-in',
          showBackdrop: false,
          maxWidth: 200,
          duration: 1500
        });
      };
      self.showLongTimeToast = function (content) {//长时间底部提示toast
        $ionicLoading.show({
          template: (angular.isDefined(content) ? content : '操作失败'),
          animation: 'fade-in',
          showBackdrop: false,
          maxWidth: 200,
          duration: 2000
        });
      };
      self.showShortTimeToast = function (content) {
        $ionicLoading.show({
          template: (angular.isDefined(content) ? content : '操作失败'),
          animation: 'fade-in',
          showBackdrop: false,
          maxWidth: 200,
          duration: 1000
        });
      };
      //弹出确认对话框
      self.alert = function (template, title, callback) {
        var alertPopup = $ionicPopup.alert({
          title: (angular.isDefined(title) ? title : '提示'),
          template: template,
          buttons: [{
            text: '确定',
            type: 'button-clear button-balanced'
          }]
        });
        alertPopup.then(callback);
      };
      //弹出是否确认对话框
      self.confirm = function (template, title, callback) {
        var confirmPopup = $ionicPopup.confirm({
          title: (angular.isDefined(title) ? title : '提示'),
          template: template,
          cancelText: '取消',
          cancelType: 'button-clear button-stable',
          okText: '确定',
          okType: 'button-clear button-balanced'
        });
        confirmPopup.then(callback);
      };
      return self;
    }
  ])
  .factory('hmsDateFormat', [
    '$filter',
    function ($filter) {
      return {
        toDate: function (date) {
          return $filter('date')(date, 'yyyy-MM-dd');
        },
        toDateTime: function (date) {
          return $filter('date')(date, 'yyyy-MM-dd HH:mm:ss');
        }
      }
    }]);

/**
 * Created by Winward on 2017/9/29.
 */
utilModule.service("$hecUtil",function () {
  return {
    compileStr:compileStr,
    uncompileStr:uncompileStr
  }

  //对字符串进行加密
  function compileStr(code){
    var c=String.fromCharCode(code.charCodeAt(0)+code.length);
    for(var i=1;i<code.length;i++)
    {
      c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));
    }
    return escape(c);   }

  //字符串进行解密
  function uncompileStr(code){
    code=unescape(code);
    var c=String.fromCharCode(code.charCodeAt(0)-code.length);
    for(var i=1;i<code.length;i++)
    {
      c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));
    }
    return c;   }
});


/**
 * Created by Winward on 2017/10/11.
 */

serverPathModule.controller('serverPathCtrl', ['$scope', '$rootScope', '$state', '$ionicPopup','baseConfig','$ionicModal',
  function ($scope, $rootScope, $state, $ionicPopup,baseConfig,$ionicModal) {
    $scope.serverData = {
      baseUrl:window.localStorage.localBaseUrl
    };
    //显示历史地址列表
    $scope.showHistoryServerUrl = function () {
      if(!window.localStorage.historyServerUrlList || window.localStorage.historyServerUrlList.length == 0){
        $scope.historyServerUrlListList = [];
      }else{
        $scope.historyServerUrlListList = JSON.parse(window.localStorage.historyServerUrlList);
      }
      $scope.historyServerUrlModal.show();
    };
    //显示历史地址列表
    $scope.hideHistoryServerUrl = function () {
      $scope.historyServerUrlModal.hide();
    };
    $ionicModal.fromTemplateUrl('history-serverUrl-modal.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.historyServerUrlModal = modal;
    });
    //选择历史服务器地址
    $scope.selectHistoryUrl = function (url) {
      $scope.serverData.baseUrl = url;
      $scope.hideHistoryServerUrl();
    };
    $scope.goLogin = function () {
      if($scope.serverData.baseUrl && $scope.serverData.baseUrl != ''){
        window.localStorage.localBaseUrl = $scope.serverData.baseUrl;
        baseConfig.baseUrl = $scope.serverData.baseUrl;
        $state.go("login");
      }else{
        $ionicPopup.alert({
          title: '提示',
          template: '请填写正确的服务器地址!'
        });
      }
    }
  }
]);


/**
 * Created by Aspire on 2016/5/5.
 */

loginModule.controller('loginCtrl', ['$scope', '$rootScope', '$state', '$ionicPopup', '$ionicNavBarDelegate', '$ionicHistory','$AuHttp','baseConfig','$hecUtil','$hecFingerLogin',
  function ($scope, $rootScope, $state, $ionicPopup, $ionicNavBarDelegate, $ionicHistory,auHttp,baseConfig,hecUtil,hecFingerLogin) {

    $scope.$on("$ionicView.enter", function () {
      $ionicNavBarDelegate.$getByHandle('HecBodyNavbar').showBar(false);
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({disableBack: true, historyRoot: true});
    });
    $scope.loginData = {
      user_name: "",
      user_password: "",
      user_token: "",
      registration_id: "",
      user_lang: ""
    };
    $scope.checkbox_savePwd = false;

    if (window.localStorage.user_name) {
      $scope.loginData.user_name = window.localStorage.user_name;
      if (window.localStorage.user_password) {
        $scope.loginData.user_password = window.localStorage.user_password;
        $scope.checkbox_savePwd = true;
      }
    }

    /*//跳转到服务器地址页面
    $scope.goServerPath = function () {
      $state.go('serverPath');
    };*/

    //记住密码
    $scope.savePassword = function () {
      $scope.checkbox_savePwd = !$scope.checkbox_savePwd;
      if ($scope.loginData.user_password) {
        if ($scope.checkbox_savePwd) {
          window.localStorage.user_password = $scope.loginData.user_password;
        } else {
          window.localStorage.user_password = "";
        }
      }
    };

    $scope.doLogin = function () {
      console.log($scope.loginData.base_url);
      if ($scope.loginData.user_name === "" || $scope.loginData.user_password === "") {
        $ionicPopup.alert({
          title: "错误",
          template: "<div style='text-align:center'>" + "请填写账号密码" + "</div>"
        });
        return;
      }
      window.localStorage.user_name = $scope.loginData.user_name;
      if ($scope.checkbox_savePwd) {
        window.localStorage.user_password = $scope.loginData.user_password;
      } else {
        window.localStorage.user_password = "";
      }
      //$scope.loginData.registration_id = $rootScope.registration_id;
      //baseConfig.baseUrl = window.localStorage.localBaseUrl;

      //   var url = $scope.loginData.base_url + '/app_login.svc';
      //   baseConfig.baseUrl = $scope.loginData.url;
      var url = baseConfig.baseUrl + '/app_login.svc';
      if(typeof(window.plugins) != 'undefined'){
        // window.plugins.jPushPlugin.getRegistrationID(function (res) {
          var params = {
            user_name: $scope.loginData.user_name,
            user_password: $scope.loginData.user_password,
            user_token: $scope.loginData.user_token
            //registration_id:res
          };
          auHttp.request({
            url: url,
            para: params
          }).then(function (response) {
            var result = response.response.status;
            var user_name = result.user_name;
            window.sessionStorage.username = user_name;
            var localHistoryServerUrlList =[];
            if(!window.localStorage.historyServerUrlList){
              localHistoryServerUrlList.push(baseConfig.baseUrl);
              window.localStorage.historyServerUrlList = JSON.stringify(localHistoryServerUrlList);
            }
            else{
              localHistoryServerUrlList = JSON.parse(window.localStorage.historyServerUrlList);
              if(localHistoryServerUrlList.indexOf(baseConfig.baseUrl) == '-1'){
                localHistoryServerUrlList.push(baseConfig.baseUrl);
                window.localStorage.historyServerUrlList = JSON.stringify(localHistoryServerUrlList);
              }
            }
            $state.go('home', {userName: user_name});
            //开启极光推送
            //jpush_config();

            /*var name = $scope.loginData.user_name;
            var password = $scope.loginData.user_password;
            hecFingerLogin.loginSuccessAction(name,password).then(function () {
              window.sessionStorage.username = user_name;
              $state.go('home', {userName: user_name});
            },function () {
            });*/
          }, function (data, status, headers, config) {});
        //});
      }else{
        var params = {
          user_name: $scope.loginData.user_name,
          user_password: $scope.loginData.user_password,
          user_token: $scope.loginData.user_token
        };
        auHttp.request({
          url: url,
          para: params
        }).then(function (response) {
          var result = response.response.status;
          var user_name = result.user_name;
          window.sessionStorage.username = user_name;
          /*window.sessionStorage.username = user_name;
          var localHistoryServerUrlList =[];
          if(!window.localStorage.historyServerUrlList){
            localHistoryServerUrlList.push(baseConfig.baseUrl);
            window.localStorage.historyServerUrlList = JSON.stringify(localHistoryServerUrlList);
          }
          else{
            localHistoryServerUrlList = JSON.parse(window.localStorage.historyServerUrlList);
            if(localHistoryServerUrlList.indexOf(baseConfig.baseUrl) == '-1'){
              localHistoryServerUrlList.push(baseConfig.baseUrl);
              window.localStorage.historyServerUrlList = JSON.stringify(localHistoryServerUrlList);
            }
          }*/
          $state.go('home', {userName: user_name});
          //开启极光推送
          //jpush_config();

          /*var name = $scope.loginData.user_name;
          var password = $scope.loginData.user_password;
          hecFingerLogin.loginSuccessAction(name,password).then(function () {
            window.sessionStorage.username = user_name;
            $state.go('home', {userName: user_name});
          },function () {
          });*/
        }, function (data, status, headers, config) {});
      }

    };



    /*setTimeout(function () {
      hecFingerLogin.fingerLogin().then(function () {
        //把本地的用户名密码设置进去，手动触发登录按钮
        $scope.loginData.user_name = hecUtil.uncompileStr(window.localStorage.userName);
        $scope.loginData.user_password = hecUtil.uncompileStr(window.localStorage.userPassword);
        $scope.doLogin();
      })
    },2000)*/


    //极光推送
    // function jpush_config() {
    //   /*//登录成功设置推送
    //   var setAliasCallback = function (event) {
    //     alert(event.resultCode);
    //   };
    //   var config = {
    //     "stac": setAliasCallback
    //   };*/
    //   if (ionic.Platform.isAndroid()) {
    //     if (window.plugins.jPushPlugin) {
    //       //jPushService.init(config);
    //       window.plugins.jPushPlugin.init();
    //       //window.plugins.jPushPlugin.setAlias(username);
    //     }
    //   }
    //   if (ionic.Platform.isIOS()) {
    //     if (window.plugins.jPushPlugin) {
    //       //jPushService.init(config);
    //       window.plugins.jPushPlugin.init();
    //       //window.plugins.jPushPlugin.setAlias(username);
    //       window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
    //       window.plugins.jPushPlugin.resetBadge();
    //     }
    //   }
    // }
  }
]);



homeModule.service('$nineBlockDelegate', ionic.DelegateService([
  'refreshTipCount'
]))
.controller('homeCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$ionicHistory',
    '$http',
    '$stateParams',
    '$nineBlockDelegate',
    '$ionicNavBarDelegate',
    function ($scope, $rootScope, $state, $ionicHistory,$http,$stateParams,$nineBlockDelegate,$ionicNavBarDelegate) {
      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParam) {
        if (toState && fromState && fromState.name && toState.name == "home") {
          $nineBlockDelegate.$getByHandle('fun-list').refreshTipCount();
          $ionicHistory.clearCache();
        }
      });

      var user_name = $stateParams.userName;
      $scope.user_name = user_name;
      $scope.goState = function (cell) {
        var state = cell.fun_url;
        //var type = cell.fun_code;
        var code = cell.fun_type;
        if (!state) {
          return;
        }
        if (state == 'workflow-list') {
          $state.go(state,{type:code,userName:user_name});
        }
        if (state == 'setting') {
          $state.go(state);
        }
      };
      $scope.linein = 0;
      $scope.pan = false;
      $scope.setLine = function (lineindex) {

        $scope.linein = lineindex;
        return false;

      };
      $scope.setlie = function (lielie, data) {
        if ($scope.linein == 0) {
          if (lielie == 0) {
            return true;

          }
          else if (lielie == 2) {
            if (data[$scope.linein][lielie - 1].fun_name != undefined) {
              return true;
            }
          }
          else {
            if (data[$scope.linein][lielie - 1].fun_name != undefined && data[$scope.linein][lielie + 1].fun_name == undefined) {
              return true;
            }

          }


        }
        else if ($scope.linein == 2) {
          if (lielie == 0) {
            if (data[$scope.linein - 1][lielie + 2].fun_name != undefined && data[$scope.linein][lielie + 1].fun_name == undefined) {
              return true;
            }

          }
          else if (lielie == 2) {
            if (data[$scope.linein][lielie - 1].fun_name != undefined) {
              return true;
            }
          }
          else {
            if (data[$scope.linein][lielie - 1].fun_name != undefined && data[$scope.linein][lielie + 1].fun_name == undefined) {
              return true;
            }

          }
        }
        else {

          if (lielie == 0) {

            if (data[$scope.linein - 1][lielie + 2].fun_name != undefined && data[$scope.linein][lielie + 1].fun_name == undefined) {

              return true;
            }
          }
          else if (lielie == 2) {
            if (data[$scope.linein][lielie - 1].fun_name != undefined && data[$scope.linein + 1][lielie - 2].fun_name == undefined) {
              return true;
            }

          }
          else {
            if (data[$scope.linein][lielie - 1].fun_name != undefined && data[$scope.linein][lielie + 1].fun_name == undefined) {
              return true;
            }

          }

        }
        return false;
      }

      $scope.refreshTipsCount = function () {
        $nineBlockDelegate.$getByHandle('fun-list').refreshTipCount();
      };

      function __init() {}

      __init();


    }])
  .controller('$nineBlockCtrl', [
  '$scope',
  '$nineBlockDelegate',
  '$ionicHistory',
  function($scope, $nineBlockDelegate, $ionicHistory){
    var self = this;
    var deregisterInstance = $nineBlockDelegate._registerInstance(
      self, $scope.config.delegateHandle, function(){
        return $ionicHistory.isActiveScope($scope);
      }
    );

    self.refreshTipCount = function(){
      console.log(' $nineBlockCtrl -- self.refreshTipCount ');
      $scope.refreshTipsCount();
    };

  }]);




settingModule.controller("settingCtrl",["$scope",'$ionicHistory','$ionicPopup','$ionicModal','baseConfig','$AuHttp','$state',function ($scope,$ionicHistory,$ionicPopup,$ionicModal,baseConfig,auHttp,$state) {
  var baseUrl = baseConfig.baseUrl; //调用接口的基础路径
  $scope.changePassWordData ={
    user_name:'',
    old_password:'',
    new_password:'',
    confirm_new_password:''
  };
  //切换极光推送
  // $scope.toggleOpenPush = function () {
  //   if($scope.isOpenPush){
  //     window.plugins.jPushPlugin.stopPush();
  //   }else{
  //     window.plugins.jPushPlugin.resumePush();
  //   }
  //   $scope.isOpenPush =!$scope.isOpenPush;
  // };

  //修改密码动作
  $scope.changePassWord = function () {
    if($scope.changePassWordData.old_password
      && $scope.changePassWordData.new_password
      && $scope.changePassWordData.confirm_new_password
      && $scope.changePassWordData.old_password != ''
      && $scope.changePassWordData.new_password != ''
      && $scope.changePassWordData.confirm_new_password != ''){

      var url = baseUrl + '/password_modify.svc';
      var params = {
        user_name:window.sessionStorage.username,
        old_password:$scope.changePassWordData.old_password,
        new_password:$scope.changePassWordData.new_password,
        confirm_password:$scope.changePassWordData.confirm_new_password
      };
      auHttp.request({
        url: url,
        para: params
      })
        .then(
          function (res) {
            console.log(res.response.status);
            var alertPopup = $ionicPopup.alert({
              title: '提示',
              template: res.response.status.errormsg
            });
            alertPopup.then(function() {
              $scope.changePassWordModal.hide().then(function () {
                $scope.changePassWordData ={
                  user_name:'',
                  old_password:'',
                  new_password:'',
                  confirm_new_password:''
                };
                $state.go('login');
              });
            });
          },
          function (res) {

          });
    }else{
      $ionicPopup.alert({
        title: '提示',
        template: '请按要求填写信息!'
      });
    }
  };

  $ionicModal.fromTemplateUrl('change-password-modal.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.changePassWordModal = modal;
  });

  //显示修改密码modal
  $scope.openChangePassWord = function () {
    $scope.changePassWordModal.show();
  };
  //隐藏修改密码modal
  $scope.hideChangePassWord = function () {
    $scope.changePassWordData ={
      user_name:'',
      old_password:'',
      new_password:'',
      confirm_new_password:''
    };
    $scope.changePassWordModal.hide();
  };



  //返回按钮
  $scope.goBack = function () {
    $ionicHistory.goBack();
  };
  //退出登录
  $scope.logout = function () {
    var url = baseUrl + '/app_logout.svc';
    var params = {
    };
    auHttp.request({
      url: url,
      para: params
    })
      .then(
        function () {
          $state.go('login');
        },
        function () {
          $state.go('login');
      });
  };

  //初始化
  //init();

  // function init() {
  //   if(ionic.Platform.isAndroid()){
  //     $scope.isAndroid = true ;
  //     window.plugins.jPushPlugin.isPushStopped(function (result) {
  //       if (result == 0) {
  //         // 开启
  //         $scope.isOpenPush = true;
  //       } else {
  //         // 关闭
  //         $scope.isOpenPush = false;
  //       }
  //     })
  //   }
  // }



}]);

var wxApp = angular.module('wxApp', [
  'ionic',
  'baseConfig',
  'utilModule',
  'HmsModule',
  'workflowModule',
  'loginModule',
  'homeModule',
  'ngCordova',
  'hecModule',
  'settingModule',
  'serverPathModule',
  'JPushServiceModule'
]);

wxApp.run(['$ionicPlatform',function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString("#3c9bd3");
    }
  })

  //返回键处理
  // $ionicPlatform.registerBackButtonAction(function (e) {
  //   e.preventDefault();
  //   return false;
  // }, 401);//101不禁止返回键对弹出框 401
}
])
.config(['$httpProvider', '$stateProvider','$ionicConfigProvider','$urlRouterProvider',
  function ($httpProvider, $stateProvider,$ionicConfigProvider,$urlRouterProvider) {
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('bottom');

    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
    $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');
    //$ionicConfigProvider.views.swipeBackEnabled(false);
    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');
    $ionicConfigProvider.backButton.text('').previousTitleText('').icon('ion-chevron-left');
    $ionicConfigProvider.scrolling.jsScrolling(true);
    $stateProvider
     /* .state('serverPath', {
        url: '/serverPath',
        templateUrl: 'build/pages/serverPath/serverPath.html',
        controller: 'serverPathCtrl'
      })*/
      .state('login', {
       url: '/login',
       templateUrl: 'build/pages/login/login.html',
       controller: 'loginCtrl'
       })
      .state('home', {
        url: '/home/{userName}',
        templateUrl: 'build/pages/home/home.html',
        controller: 'homeCtrl'
      })
      .state('workflow-list', {
        url: '/workflow-list/{type}/{userName}',
        templateUrl: 'build/pages/workflow/list/list.html',
        controller: 'workflowListCtrl'
      })
      .state('workflow-detail', {
        url: '/workflow-detail/{template_code}/{instance_id}/{node_id}/{record_id}',
        templateUrl: 'build/pages/workflow/detail/detail.html',
        controller: 'workflowDetailCtrl'
      })
      .state('atm_priview', {
        url: '/atm_priview/{url}',
        templateUrl: 'build/pages/workflow/detail/atm_priview.html',
        controller: 'AtmPriviewController'
      })
      .state('setting', {
        url: '/setting',
        templateUrl: 'build/pages/setting/setting.html',
        controller: 'settingCtrl'
      });

    /*var flag = typeof(window.localStorage.localBaseUrl)=="undefined"?false:true;
    if(flag){
      $urlRouterProvider.otherwise('/login');
    }else{
      $urlRouterProvider.otherwise('/serverPath');
    }*/
      $urlRouterProvider.otherwise('/login');
  }
]);





/* * Created by Aspire on 2016/9/1.*/
workflowModule.factory('workflowService', [
	'$timeout',
	'baseConfig',
	'hmsHttp',
	'hmsPopup',
	'$window',
	'$AuHttp',
	'$stateParams',
	function($timeout, baseConfig, hmsHttp, hmsPopup, $window, auHttp, $stateParams) {

		var baseUrl = baseConfig.baseUrl; //调用接口的基础路径
		var oneHistoryNodeWidth = 102; //一个审批历史节点的宽度
		var workflowTypeNameLabel = '工作流类型'; //工作流类型名称的页面提示文字
		var lastApproveUserNameLabel = '上一节点';
		var currentNodeLabel = '当前节点'; //当前节点的页面提示文字
		var createUserNameLabel = '提交人'; //单据创建人的页面提示文字
		var approveStatusNameLabel = '审批状态';
		var approveDateLabel = '审批时间';
		var commentTextLabel = '审批意见';
		var chartStatusNameLabel = '状态';
		var instanceDescLabel = '描述';
		var instanceAmountLabel = '金额';
		var insDocNumLabel = '单据编号';
		var self = {};

		/*self.source = null; //来源数据，从获取来源接口获取
		self.detailApiUrl = null; //明细页面调用接口时url中需要传入的对应的接口数据，根据template_code通过调用接口获取*/
		self.doWorkflowActionSuccess = false; //执行审批操作是否成功标志，明细页面执行审批操作成功后返回列表页面去除对应的审批完成的单据时用到

		//获取消息来源列表，之后立即获取todo、done or apply列表数据
		self.getSourceList = function(scope) {
			var success = function(result) {
				if(result.success) {
					scope.sourceList = result.rows;
					//初始化默认选中的来源
					self.source = scope.sourceList[0];
					//初始化来源筛选项的数据，并设为默认显示
					angular.forEach(scope.sourceList, function(data) {
						var sourceItem = {
							itemCode: data.source_id,
							itemName: data.source_name,
							selected: false
						};
						if(data.source_id == self.source.source_id) {
							sourceItem.selected = true;
							//初始化默认来源对应的筛选类型
							scope.filterTypeList = [{
								typeCode: 'SOURCE',
								typeName: '数据来源',
								selected: true
							}, {
								typeCode: 'TEMPLATE',
								typeName: '工作流类型',
								selected: false
							}];
							angular.forEach(data.condition, function(data) {
								var filterTypeItem = {
									typeCode: data.conditionTypeCode.toUpperCase(),
									typeName: data.conditionTypeName,
									selected: false
								};
								scope.filterTypeList.push(filterTypeItem);
								//为每一种额外增加的筛选类型初始化一个存放筛选项列表数据的空数组，列表位于extra对象中
								var typeCode = data.conditionTypeCode;
								var typeCodeCamel = typeCode.replace(/_(\w)/g, function(str) {
									return str.slice(1).toUpperCase();
								});
								var typeCodeList = typeCodeCamel + 'List';
								scope.filterConditionOption.extra[typeCodeList] = [];
								//为每一种额外增加的筛选类型初始化一个存放筛选项选择结果的字段，字段位于extra对象中
								var extraTypeCode = typeCode + '_code';
								scope.filterCondition.extra[extraTypeCode] = '';
							});
						}
						scope.filterConditionOption.sourceList.push(sourceItem);
					});
					scope.filterItemList = scope.filterConditionOption.sourceList;
					scope.filterConditionOption.currentCheckedType = 'SOURCE';
					self.getListData(scope);
				} else {
					scope.isLoadingData = false;
					hmsPopup.showLongTimeToast('获取数据来源失败');
				}
			};
			var error = function(result, status) {
				//scope.isLoadingData = false;
				self.getListData(scope);
				if(!(status == 401 || status == 404)) {
					hmsPopup.showLongTimeToast('获取数据来源失败');
				}
			};
			var url = baseUrl + '/i/api/mobileApi/getSourceList';
			hmsHttp.get(url)
				.success(function(response) {
					success(response);
				}).error(function(response, status) {
					error(response, status);
				});
		};

		//获取todo、done or apply列表数据
		self.getListData = function(scope) {
			scope.pageNum = 1;
			var success = function(result) {
				processList(false, scope, result);
			};
			var error = function(result, status) {
				scope.isLoadingData = false;
				if(scope.isRefresh) {
					scope.isRefreshingData = false;
					scope.$broadcast('scroll.refreshComplete');
				}
			};
			getListDataService(false, scope, success, error);
		};

		//获取todo、done or apply列表数据的方法主体
		var getListDataService = function(isLoadMore, scope, success, error) {
			if(isLoadMore) {
				scope.isLoadingMoreData = true;
			} else {
				scope.list = [];
				scope.isLoadingData = true;
				scope.canLoadMoreData = false;
				if(scope.isRefresh) {
					scope.isRefreshingData = true;
				}
			}
			//baseConfig.baseUrl = window.localStorage.localBaseUrl;

			var url = baseUrl + '/modules/hmap/wfl/hmap_wfl_todo_list_query_and_batch_approve.svc';
			var params = {
				action: 'getWorkflowList',
				workflow_condition: {
					approve_user_code: window.sessionStorage.username,
					workflow_status: scope.filterCondition.workflow_status,
					condition: scope.filterCondition.condition,
					template_code: scope.filterCondition.template_code,
					page: scope.pageNum,
					page_count: baseConfig.pageCount,
					code: scope.code
				}
			};
			auHttp.request({
				url: url,
				para: params
			}).then(function(response) {
				success(response.response);
			}, function(response) {
				error(response.response);
			});

		};

		//获取todo、done or apply列表数据成功之后执行的核心操作，需要再去获取对应的用户头像
		var processList = function(isLoadMore, scope, result) {
			if(result.status && result.status.errorcode == '0') {
				var list = result.workflow_list;
				//提取返回数据中的create_user_code数组，获取用户头像时用到
				var userCodeList = [];
				angular.forEach(list, function(data) {
					var userCode = data.create_user_code;
					userCodeList.push(userCode);
				});
				var success = function(result) {
					for(var i = 0; i < list.length; i++) {
						list[i].create_user_icon = "build/img/head.png";
					}

					angular.forEach(list, function(data) {
						var item = {
							is_todo: scope.workflowStatus.isTodo,
							is_done: scope.workflowStatus.isDone,
							is_apply: scope.workflowStatus.isApply,
							create_user_icon: data.create_user_icon,
							workflow_title: data.workflow_title,
							workflow_name: data.workflow_name,
							workflow_type_name_label: workflowTypeNameLabel,
							workflow_type_name: data.workflow_name,
							last_approve_user_name_label: lastApproveUserNameLabel,
							last_approve_user_name: data.last_approve_user_name || data.create_user_name,
							current_node_label: currentNodeLabel,
							current_node: data.current_node,
							create_user_name_label: createUserNameLabel,
							create_user_name: data.create_user_name,
							approve_status_name_label: approveStatusNameLabel,
							approve_status_name: data.approve_status_name,
							approve_date_label: approveDateLabel,
							approve_date: data.approve_date,
							comment_text_label: commentTextLabel,
							comment_text: data.comment_text || '无',
							chart_status_name_label: chartStatusNameLabel,
							chart_status_name: data.chart_status_name,
							create_user_code: data.create_user_code,
							template_code: data.template_code,
							instance_id: data.source_instance_id,
							record_id: data.source_record_id,
							node_id: data.source_node_id,
							instance_desc_label: instanceDescLabel,
							instance_desc: data.instance_desc,
							instance_amount_label: instanceAmountLabel,
							instance_amount: data.instance_amount,
							ins_doc_num_label: insDocNumLabel,
							ins_doc_num: data.ins_doc_num
						};
						scope.list.push(item);
					});
					if(!list || list.length < baseConfig.pageCount) {
						scope.canLoadMoreData = false;
					} else {
						scope.canLoadMoreData = true;
					}
					if(isLoadMore) {
						scope.isLoadingMoreData = false;
						scope.$broadcast('scroll.infiniteScrollComplete');
					} else {
						scope.isLoadingData = false;
						if(scope.isRefresh) {
							scope.isRefreshingData = false;
							scope.$broadcast('scroll.refreshComplete');
						}
					}
				};
				var error = function(result, status) {
					scope.canLoadMoreData = false;
					if(isLoadMore) {
						scope.isLoadingMoreData = false;
						scope.$broadcast('scroll.infiniteScrollComplete');
					} else {
						scope.isLoadingData = false;
						if(scope.isRefresh) {
							scope.isRefreshingData = false;
							scope.$broadcast('scroll.refreshComplete');
						}
					}
				};
				//获取todo、done or apply列表数据返回不为空时，获取对应的用户头像
				getUserIconList(userCodeList, success, error);
				/* if (userCodeList.length) {
				   getUserIconList(userCodeList, success, error);
				 } else {
				   scope.canLoadMoreData = false;
				   if (isLoadMore) {
				     scope.isLoadingMoreData = false;
				     scope.$broadcast('scroll.infiniteScrollComplete');
				   } else {
				     scope.isLoadingData = false;
				     if (scope.isRefresh) {
				       scope.isRefreshingData = false;
				       scope.$broadcast('scroll.refreshComplete');
				     }
				   }
				   if (scope.list.length) {
				     hmsPopup.showShortTimeToast('没有更多数据了');
				   } else {
				     hmsPopup.showShortTimeToast('暂无数据');
				   }
				 }*/
			} else {
				scope.canLoadMoreData = false;
				if(isLoadMore) {
					scope.isLoadingMoreData = false;
					scope.$broadcast('scroll.infiniteScrollComplete');
				} else {
					scope.isLoadingData = false;
					if(scope.isRefresh) {
						scope.isRefreshingData = false;
						scope.$broadcast('scroll.refreshComplete');
					}
				}
				hmsPopup.showLongTimeToast('获取审批列表失败');
			}
		};

		//获取template，根据source_id获取对应的template数据
		/*  self.getTemplateList = function (scope) {
		    scope.filterItemList = [];
		    var success = function (result) {
		      //获取template筛选项的数据，并显示
		      if (result.success) {
		        var firstItem = {
		          itemCode: '',
		          itemName: '全部',
		          selected: true
		        };
		        scope.filterConditionOption.templateList.push(firstItem);
		        angular.forEach(result.rows, function (data) {
		          var templateItem = {
		            itemCode: data.templateCode,
		            itemName: data.workflow_name,
		            selected: false
		          };
		          scope.filterConditionOption.templateList.push(templateItem);
		        });
		        scope.filterItemList = scope.filterConditionOption.templateList;
		      }
		    };
		    var error = function (result, status) {
		    };
		    var source_id = self.source.source_id;
		    var url = baseUrl + '/i/api/mobileApi/getTemplate?source_id=' + source_id;
		    hmsHttp.get(url)
		      .success(function (response) {
		        success(response);
		      }).error(function (response, status) {
		      error(response, status);
		    });
		  };*/

		//获取detailApiUrl，detailApiUrl获取之后立即获取明细页面数据
		/*self.getDetailApiUrl = function (scope, data) {
		  var success = function (result) {
		    if (result.success) {
		      self.detailApiUrl = result.rows[0] || {};
		      self.getDetailData(scope, data);
		    }
		  };
		  var error = function (result, status) {
		    scope.isLoadingData = false;
		    if (!(status == 401 || status == 404)) {
		      hmsPopup.showLongTimeToast('获取明细API失败');
		    }
		  };
		  var url = baseUrl + '/i/api/mobileApi/getGetWorkflowDetailApiUrl?template_code=' + data.template_code;
		  hmsHttp.get(url)
		    .success(function (response) {
		      success(response);
		    }).error(function (response, status) {
		    error(response, status);
		  });
		};*/

		//获取额外筛选条件，根据typeCode获取对应的额外筛选项数据
		/*self.getExtraCondition = function (scope, typeCode) {
		  scope.filterItemList = [];
		  var success = function (result) {
		    //获取额外筛选项的数据，并显示
		    if (result.status && result.status.errorcode == '0') {
		      var firstItem = {
		        itemCode: '',
		        itemName: '全部',
		        selected: true
		      };
		      //将typeCode的_命名形式改成驼峰命名形式，并加上List结尾，组成存放额外筛选项的字段名
		      var typeCodeCamel = typeCode.replace(/_(\w)/g, function (str) {
		        return str.slice(1).toUpperCase();
		      });
		      var typeCodeList = typeCodeCamel + 'List';
		      scope.filterConditionOption.extra[typeCodeList].push(firstItem);
		      angular.forEach(result.condition, function (data) {
		        var typeCodeItem = {
		          itemCode: data.condition_code,
		          itemName: data.condition_name,
		          selected: false
		        };
		        scope.filterConditionOption.extra[typeCodeList].push(typeCodeItem);
		      });
		      scope.filterItemList = scope.filterConditionOption.extra[typeCodeList];
		    }
		  };
		  var error = function (result, status) {
		  };
		  var sysName, apiName;
		  angular.forEach(self.source.condition, function (data) {
		    if (typeCode == data.conditionTypeCode) {
		      sysName = data.sysName;
		      apiName = data.apiName;
		      return false;
		    }
		  });
		  var url = baseUrl + '/r/api?sysName=' + sysName + '&apiName=' + apiName;
		  var params = {
		    action: 'getCondition',
		    condition_type_code: typeCode,
		    current_user_code: window.sessionStorage.username
		  };
		  hmsHttp.post(url, params)
		    .success(function (response) {
		      success(response);
		    }).error(function (response, status) {
		    error(response, status);
		  });
		};*/

		//获取更多todo、done or apply列表数据
		self.getMoreListData = function(scope) {
			scope.pageNum += 1;
			var success = function(result) {
				processList(true, scope, result);
			};
			var error = function(result, status) {
				scope.canLoadMoreData = false;
				scope.isLoadingMoreData = false;
				scope.$broadcast('scroll.infiniteScrollComplete');
			};
			if(!scope.isLoadingMoreData) {
				getListDataService(true, scope, success, error);
			}
		};

		//获取明细页面数据
		self.getDetailData = function(scope, stateParams) {
			scope.isLoadingData = true;
			var success = function(result) {
				processDetail(scope, result);
				scope.isLoadingData = false;
			};
			var error = function(result, status) {
				scope.isLoadingData = false;
			};
			getDetailDataService(stateParams, success, error);
		};

		//获取转交人列表数据
		self.getTransmitPerson = function(condition, pageNum, success, error) {
			var url = baseUrl + '/modules/hmap/exp/hmap_emp_info_query.svc';
			var params = {
				action: 'getUserList',
				condition: condition,
				page: pageNum,
				page_count: baseConfig.pageCount,
				current_user_code: window.sessionStorage.username
			};
			auHttp.request({
				url: url,
				para: params
			}).then(function(response) {
				success(response.response);
			}, function(response) {
				error(response.response);
			})
		};

		//执行审批操作
		self.doWorkflowAction = function(actionType, stateParams, forwardUserCode, commentText, success, error) {
			var url = baseUrl + '/modules/hmap/wfl/hmap_wfl_workflow_approve.svc';
			var params = {};
			if(actionType == "4" || actionType == "5") {
				var priority = "";
				if(actionType == "4") priority = "BEFORE";
				else priority = "AFTER";
				params = {
					action: 'setWorkflowStatus',
					template_code: stateParams.template_code,
					source_instance_id: stateParams.instance_id,
					source_node_id: stateParams.node_id,
					source_record_id: stateParams.record_id,
					workflow_status: {
						action: "5",
						priority: priority,
						current_user_code: window.sessionStorage.username,
						forward_user_code: forwardUserCode,
						comment_text: commentText,
						timestamp: new Date().getTime()
					}
				};
			} else {
				params = {
					action: 'setWorkflowStatus',
					template_code: stateParams.template_code,
					source_instance_id: stateParams.instance_id,
					source_node_id: stateParams.node_id,
					source_record_id: stateParams.record_id,
					workflow_status: {
						action: actionType,
						current_user_code: window.sessionStorage.username,
						forward_user_code: forwardUserCode,
						comment_text: commentText,
						timestamp: new Date().getTime()
					}
				};
			}
			auHttp.request({
				url: url,
				para: params
			}).then(function(response) {
				hmsPopup.hideLoading();
				success(response.response);
			}, function(response) {
				hmsPopup.hideLoading();
				error(response.response);
			});
		};

		//执行批量审批操作
		self.doWorkflowActionBatch = function(scope, action) {
			scope.isLoadingData = true;
			var success = function(result) {
				scope.list = scope.list.filter(function(item) {
					return item.selected != true;
				});
				scope.isLoadingData = false;
				scope.operable = true;
				hmsPopup.showLongTimeToast('工作流处理成功');
			};
			var error = function(result, status) {
				scope.isLoadingData = false;
				if(!(status == 401 || status == 404)) {
					hmsPopup.showLongTimeToast('工作流处理失败');
				}
			};
			var url = baseUrl + '/modules/hmap/wfl/hmap_wfl_todo_list_query_and_batch_approve.svc';
			var listData = scope.list.filter(function(item) {
				return item.selected == true;
			}).map(function(item) {
				return {
					template_code: item.template_code,
					source_instance_id: item.instance_id,
					source_node_id: item.node_id,
					source_record_id: item.record_id,
					workflow_status: {
						action: action,
						current_user_code: window.sessionStorage.username,
						forward_user_code: "",
						comment_text: "",
						timestamp: new Date().getTime()
					}
				}
			});
			if(listData.length == 0) {
				hmsPopup.showLongTimeToast('请选中待办事项');
				scope.isLoadingData = false;
				return;
			}
			/*hmsHttp.post(url, {
			  action: "setWorkflowStatusBatch",
			  workflow: listData
			}).success(function (response) {
			  success(response);
			}).error(function (response, status) {
			  error(response, status);
			});*/
			var params = {
				action: "setWorkflowStatusBatch",
				workflow: listData
			};
			auHttp.request({
				url: url,
				para: params
			}).then(function(response) {
				success(response.response);
			}, function(response) {
				error(response.response);
			})
		};

		//获取明细页面数据的方法主体
		var getDetailDataService = function(stateParams, success, error) {
			//var url = baseUrl + '/modules/hmap/wfl/hmap_wfl_doc_info_query.svc';
			var url = baseUrl + '/modules/hmap/wfl/hmap_wfl_doc_info_query.svc';
			var params = {
				action: 'getWorkflowDetail',
				template_code: stateParams.template_code,
				source_instance_id: stateParams.instance_id,
				source_node_id: stateParams.node_id,
				source_record_id: stateParams.record_id,
				current_user_code: window.sessionStorage.username
				/*source_instance_id:'37043',
				source_node_id:'53',
				source_record_id:'94229',
				current_user_code:'14'*/

			};
			auHttp.request({
				url: url,
				para: params
			}).then(function(response) {
				success(response.response);
			}, function(response) {
				error(response.response);
			})
		};

		//获取用户头像数据，根据获取到的todo、done or apply列表数据中的create_user_code获取对应的用户头像
		var getUserIconList = function(userList, success, error) {
			var response = {};
			success(response);
		};

		//获取明细页面数据成功之后执行的核心操作
		var processDetail = function(scope, result) {
			if(result.status && result.status.errorcode == '0') {
				scope.currentDetail = result;
				scope.historyList = result.history;
				setHistoryWidth(scope, result.history.length);
				if(result.workflow_data) {
					scope.attachmentList = result.workflow_data.attachments;
					scope.singleArrayList = result.workflow_data.details;
					angular.forEach(scope.singleArrayList, function(data) {
						data.showFlag = true;
					});
					var multipleLines = result.workflow_data.line_areas;
					scope.multipleArrayList = [];
					angular.forEach(multipleLines, function(data) {
						scope.multipleArrayList.push(processLine(data));
					});
				}

			}
		};

		//多行明细信息块对每一行的处理
		var processLine = function(line_area) {
			var oneLine = {
				title: line_area.line_area_title,
				arrayList: line_area.lines,
				currentPage: 1,
				currentArray: [],
				showFlag: true
			};
			if(line_area.lines.length) {
				var currentList = [];
				var lineTitles = line_area.line_titles;
				var list = line_area.lines[0].line;
				for(var i = 0; i < list.length; i++) { //lineTitles这里之前是list
					var line = {
						line_title: lineTitles[i].line_title,
						line_value: list[i].line_value
					};
					currentList.push(line);
				}
				oneLine.currentArray = currentList;
			}

			return oneLine;
		};

		//设置历史节点记录滚动框的宽度
		var setHistoryWidth = function(scope, length) {
			var historyWidth = document.body.clientWidth;
			try {
				historyWidth = parseInt(length) * oneHistoryNodeWidth;
			} catch(e) {}
			scope.historyWidth = {
				width: historyWidth + 'px'
			};
		};

		return self;
	}
]);
/**
 * Created by Aspire on 2016/9/1.*/
workflowModule.controller('workflowDetailCtrl', [
		'$scope',
		'$stateParams',
		'$ionicModal',
		'$ionicHistory',
		'$timeout',
		'$ionicScrollDelegate',
		'$ionicBackdrop',
		'baseConfig',
		'hmsPopup',
		'workflowService',
		'$state',
		'$ionicPlatform',
		function($scope, $stateParams, $ionicModal, $ionicHistory,
			$timeout, $ionicScrollDelegate, $ionicBackdrop, baseConfig, hmsPopup, workflowService, state, $ionicPlatform) {
			var pageNum = 1; //获取转交人列表数据的页码

			$scope.showMore = false; //一开始隐藏更多选项
			$scope.historyDisplayMode = baseConfig.historyDisplayMode; //判断审批历史怎么显示的字段，目前有fixedTop、openModal两种方式，选其一
			$scope.multipleLinesDisplayMode = baseConfig.multipleLinesDisplayMode; //判断多行明细怎么显示的字段，目前有pageUpDown、slideList两种方式，选其一
			$scope.isOpenMore = false; //是否已经展开更多工作流操作的标志
			$scope.attachmentShowFlag = true; //是否显示附件列表标记

			$scope.isLoadingData = false; //正在加载明细页面数据的标志
			$scope.isLoadingTransmitPerson = false; //正在加载转交人数据的标志
			$scope.canLoadMoreData = false; //可否获取更多转交人数据的标志

			$scope.historyList = []; //审批历史节点数据
			$scope.singleArrayList = []; //单行明细信息数据
			$scope.multipleArrayList = []; //多行的明细数据
			$scope.attachmentList = []; //附件数据
			$scope.transmitPerson = []; //转交人数据列表

			//审批所需信息
			$scope.processInfo = {
				opinion: '',
				transmitPersonCondition: '',
				transmitPerson: {
					user_code: '',
					user_desc: ''
				},
				approverList: [],
				actionType: ''
			};

			//审批操作类型
			$scope.actionType = {
				approve: baseConfig.approve,
				refuse: baseConfig.refuse,
				toOther: baseConfig.toOther,
				//goBack: baseConfig.goBack,
				addBeforeApprover: baseConfig.addBeforeApprover,
				addAfterApprover: baseConfig.addAfterApprover
			};

			//审批历史节点滚动框的宽度
			$scope.historyScrollWidth = {
				width: document.body.clientWidth + 'px'
			};

			//通用工作流
			$scope.generalUtil = {
				//显示审批历史记录modal(openModal方式展示审批历史时使用)
				openWorkflowHistoryModal: function() {
					$scope.workflowHistoryModal.show();
				},
				//隐藏审批历史记录modal(openModal方式展示审批历史时使用)
				closeWorkflowHistoryModal: function() {
					$scope.workflowHistoryModal.hide();
				},
				//查看审批历史节点的审批意见(fixedTop方式展示审批历史时使用)
				showHistoryComment: function(comment) {
					hmsPopup.alert(comment || '无', '审批意见');
				},
				//对表单数据进行展开收缩
				toggleContent: function(array, $event) {
					var handleView = $ionicScrollDelegate.$getByHandle('workflowDetailHandle').getScrollView();
					array.showFlag = !array.showFlag;
					if(array.showFlag) {
						if($event.pageY + 15 > handleView.__clientHeight) {
							var scrollPosition = $ionicScrollDelegate.$getByHandle('workflowDetailHandle').getScrollPosition();
							$ionicScrollDelegate.$getByHandle('workflowDetailHandle').scrollTo(0, (scrollPosition.top + 300), true);
							//$ionicScrollDelegate.$getByHandle('workflowDetailHandle').scrollBottom(true);
						}
					}
					$ionicScrollDelegate.resize();
				},
				//对附件数据进行展开收缩
				toggleAttachmentContent: function($event) {
					var handleView = $ionicScrollDelegate.$getByHandle('workflowDetailHandle').getScrollView();
					$scope.attachmentShowFlag = !$scope.attachmentShowFlag;
					if($scope.attachmentShowFlag) {
						if($event.pageY + 15 > handleView.__clientHeight) {
							var scrollPosition = $ionicScrollDelegate.$getByHandle('workflowDetailHandle').getScrollPosition();
							$ionicScrollDelegate.$getByHandle('workflowDetailHandle').scrollTo(0, (scrollPosition.top + 300), true);
							//$ionicScrollDelegate.$getByHandle('workflowDetailHandle').scrollBottom(true);
						}
					}
					$ionicScrollDelegate.resize();
				},
				//查看附件
				openUrl: function(url, name) {
					url = baseConfig.baseUrl + '/' + url;
					if(ionic.Platform.isIOS()) {
						window.open(url, '_system', 'location=yes');
					}
					//安卓类型
					else {
						//图片类型
						if(isImageSupport(getExtension(name))) {
							state.go('atm_priview', {
								url: url
							});
						} else {
							cordova.plugins.OfficePlugin.openFileByFileUrl(
								function() {},
								function() {
									hmsPopup.showLongTimeToast('附件打开失败');
								},
								url, false);
						}
					}
				},
				//二维表单上一页操作
				previous: function(array) {
					if(array.currentPage > 1) {
						var currentArray = array.currentArray;
						var length = currentArray.length;
						array.currentPage -= 1;
						for(var i = 0; i < length; i++) {
							currentArray[i].line_value = array.arrayList[array.currentPage - 1].line[i].line_value;
						}
					}
				},
				//二维表单下一页操作
				next: function(array) {
					if(array.currentPage < array.arrayList.length) {
						var currentArray = array.currentArray;
						var length = currentArray.length;
						array.currentPage += 1;
						for(var i = 0; i < length; i++) {
							currentArray[i].line_value = array.arrayList[array.currentPage - 1].line[i].line_value;
						}
					}
				},
				//显示转交人modal(转交人和添加审批人操作代码共用)
				openTransmitPersonModal: function(actionType) {
					$scope.processInfo.actionType = actionType;
					$scope.transmitPersonModal.show();
				},
				//隐藏转交人modal(转交人和添加审批人操作代码共用)
				closeTransmitPersonModal: function() {
					$scope.transmitPersonModal.hide();
				},
				//选择转交人
				selectTransmitPerson: function(person) {
					$scope.processInfo.transmitPerson = person;
					$scope.transmitPersonModal.hide();
					$timeout(function() {
						workflowAction($scope.processInfo.actionType);
					}, 300);
				},
				//选择要添加的审批人(多选)
				checkApprover: function(person) {
					person.checked = !person.checked;
					if(person.checked) {
						$scope.processInfo.approverList.push(person);
					} else {
						$scope.processInfo.approverList.remove(person);
					}
				},
				//确认选择要添加的审批人
				confirmApprover: function() {
					if($scope.processInfo.approverList.length) {
						$scope.transmitPersonModal.hide();
						$timeout(function() {
							workflowAction($scope.processInfo.actionType);
						}, 300);
					} else {
						hmsPopup.alert('请先添加审批人');
					}
				},
				//查询转交人数据
				searchTransmitPerson: function() {
					if($scope.processInfo.transmitPersonCondition) {
						pageNum = 1;
						$scope.isLoadingTransmitPerson = true;
						var success = function(result) {
							if(result.status && result.status.errorcode == '0') {
								$scope.transmitPerson = result.user_list;
								if(result.user_list.length < baseConfig.pageCount) {
									$scope.canLoadMoreData = false;
								} else {
									$scope.canLoadMoreData = true;
								}
							}
							$scope.isLoadingTransmitPerson = false;
						};
						var error = function(result, status) {
							$scope.canLoadMoreData = false;
							$scope.isLoadingTransmitPerson = false;
						};
						workflowService.getTransmitPerson($scope.processInfo.transmitPersonCondition, pageNum, success, error);
					}
				},
				//查询更多转交人数据
				searchMoreTransmitPerson: function() {
					if($scope.processInfo.transmitPersonCondition) {
						pageNum += 1;
						var success = function(result) {
							if(result.status && result.status.errorcode == '0') {
								Array.prototype.push.apply($scope.transmitPerson, result.user_list);
								if(result.user_list.length < baseConfig.pageCount) {
									$scope.canLoadMoreData = false;
								} else {
									$scope.canLoadMoreData = true;
								}
								$scope.$broadcast('scroll.infiniteScrollComplete');
							}
						};
						var error = function(result, status) {
							$scope.canLoadMoreData = false;
						};
						workflowService.getTransmitPerson($scope.processInfo.transmitPersonCondition, pageNum, success, error);
					}
				},
				//校验审批操作是否可以执行
				validateWorkflowAction: function(actionType) {
					if(actionType == $scope.actionType.approve) {
						workflowAction(actionType);
					} else if(actionType == $scope.actionType.refuse) {
						if($scope.processInfo.opinion) {
							workflowAction(actionType);
						} else {
							hmsPopup.alert('请输入拒绝原因', '提示', focusOnValidateFail);
						}
					} else if(actionType == $scope.actionType.toOther) {
						if($scope.processInfo.opinion) {
							this.openTransmitPersonModal(actionType);
						} else {
							hmsPopup.alert('请输入转交原因', '提示', focusOnValidateFail);
						}
					} else if(actionType == $scope.actionType.addBeforeApprover) {
						this.openTransmitPersonModal(actionType);
					} else if(actionType == $scope.actionType.addAfterApprover) {
						this.openTransmitPersonModal(actionType);
					} else {
						hmsPopup.alert('请输入处理类型');
					}
				},
				//展开或收起更多工作流操作
				toggleMore: function() {
					$scope.isOpenMore = !$scope.isOpenMore;
				}
			};

			$ionicModal.fromTemplateUrl('build/pages/workflow/modal/transmit/transmit-person-modal.html', {
				scope: $scope
			}).then(function(modal) {
				$scope.transmitPersonModal = modal;
			});

			$ionicModal.fromTemplateUrl('workflow-history-modal.html', {
				scope: $scope
			}).then(function(modal) {
				$scope.workflowHistoryModal = modal;
			});

			//工作流处理
			var workflowAction = function(actionType) {
				var commentText = $scope.processInfo.opinion;
				var forwardUserCode = '';
				var success = function(result) {
					if(result.status && result.status.errorcode == '0') {
						//判断是否是从推送过来的数据进入页面，若是审批操作成功之后需要刷新本页数据
						if(state.page == 'detail') {
							hmsPopup.showShortTimeToast('工作流处理成功,即将更新数据');
							setTimeout(function() {
								workflowService.getDetailData($scope, $stateParams);
							}, 1000);
						} else {
							workflowService.doWorkflowActionSuccess = true;
							hmsPopup.showShortTimeToast('工作流处理成功');
							setTimeout(function() {
								//$ionicHistory.goBack();
								window.history.back();
								// workflowService.getDetailData($scope, $stateParams);
							}, 1000);
						}
					} else {
						hmsPopup.showShortTimeToast('工作流处理失败');
					}
				};
				var error = function(result, status) {};
				var submit = function(res) {
					if(res) {
						hmsPopup.showLoading('工作流处理中…');
						workflowService.doWorkflowAction(actionType, $stateParams, forwardUserCode, commentText, success, error);
					}
				};
				if(actionType == $scope.actionType.toOther) {
					forwardUserCode = $scope.processInfo.transmitPerson.user_code;
					hmsPopup.confirm('是否确认转交给：' + $scope.processInfo.transmitPerson.user_desc + '?', undefined, submit);
				} else if(actionType == $scope.actionType.addBeforeApprover || actionType == $scope.actionType.addAfterApprover) {
					var approvers = $scope.processInfo.approverList;
					var len = approvers.length;
					var template = '<div style="text-align: left">' + '添加如下审批人：' + '</div>';
					for(var i = 0; i < len; i++) {
						template += '<div style="text-align: left;padding: 0 20px">' + (i + 1) + '. ' + approvers[i].user_desc + '</div>';
					}
					template += '<div style="text-align: left">' + '是否确认?' + '</div>';
					template = '<div style="display: inline-block">' + template + '</div>';
					var approverCodeList = [];
					angular.forEach(approvers, function(data) {
						approverCodeList.push(data.user_code);
					});
					forwardUserCode = approverCodeList.join(',');
					hmsPopup.confirm(template, undefined, submit);
				} else {
					hmsPopup.confirm('是否确认提交处理工作流?', undefined, submit);
				}
			};

			//审批意见校验为空时聚焦到输入框
			var focusOnValidateFail = function(res) {
				scrollToBottom();
				$timeout(function() {
					document.querySelector('#option').focus();
				}, 0);
			};

			//滚动到页面底部，审批校验失败时使用
			var scrollToBottom = function() {
				$ionicScrollDelegate.$getByHandle('workflowDetailHandle').scrollBottom(true);
			};

			//从文件名中获取文件扩展名
			function getExtension(fileName) {
				var array = fileName.split('.');
				//console.log(array.length - 1);
				return array[array.length - 1];
			}

			//判断是否为图片类型
			function isImageSupport(ext) {
				var img_support_ext = ['png', 'jpg', 'bmp', 'jpeg', 'gif', 'icon', 'ico'];
				if(img_support_ext.indexOf(ext) > -1) {
					console.log("2");
					return true;
				} else {
					return false;
				}
			}

			Array.prototype.contains = function(item) {
				for(var i = 0; i < this.length; i++) {
					if(this[i] === item) return true;
				}
				return false;
			};

			Array.prototype.indexOf = function(val) {
				for(var i = 0; i < this.length; i++) {
					if(this[i] == val) return i;
				}
				return -1;
			};

			Array.prototype.remove = function(val) {
				var index = this.indexOf(val);
				if(index > -1) {
					this.splice(index, 1);
				}
			};

			workflowService.getDetailData($scope, $stateParams);

			/* if (window.sessionStorage.token && window.sessionStorage.username) {
			   if (workflowService.detailApiUrl) {
			     workflowService.getDetailData($scope, $stateParams);
			   } else {
			     workflowService.getDetailApiUrl($scope, $stateParams);
			   }
			 }
			 else {
			   workflowService.getToken($scope, $stateParams);
			 }*/

			//返回按钮
			$scope.goBack = function() {
				$ionicHistory.goBack();
			}
		}
	])

	.controller('AtmPriviewController', [
		'$scope',
		'$state',
		'$stateParams',
		'$sce',
		'$ionicHistory',
		function($scope, $state, $stateParams, $sce, $ionicHistory) {

			$scope.priviewUrl = $sce.trustAsResourceUrl($stateParams.url);
			//返回按钮
			$scope.goBack = function() {
				$ionicHistory.goBack();
			}
		}
	]);
/**
 * Created by Aspire on 2016/8/31.
 */
workflowModule.controller('workflowListCtrl', ['$scope', '$state', '$stateParams', '$ionicModal', '$timeout', '$ionicScrollDelegate', 'baseConfig', 'workflowService','$ionicHistory',
  function ($scope, $state, $stateParams, $ionicModal, $timeout, $ionicScrollDelegate, baseConfig, workflowService,$ionicHistory) {
    var lastCheckedSource = null; //上一个选择的来源
    $scope.operable = true; //进入页面列表项的可操作状态，选中是可操作为true，再次点击或者跳转到其他页取消选中，即取消操作为false
    //判断当前是todo、done or apply页面
    $scope.workflowStatus = {
      code: '',
      isTodo: false,
      isDone: false,
      isApply: false
    };
    $scope.type = $stateParams.type;
   // $scope.code = $stateParams.type;
    $scope.filterTypeList = []; //筛选类型列表
    $scope.filterItemList = []; //筛选类型对应的筛选项列表
    $scope.sourceList = []; //来源列表，数据来自获取来源列表接口

    //筛选条件本地相关配置
    $scope.filterConditionOption = {
      currentCheckedType: '', //当前选中的筛选类型
      sourceList: [], //数据来源类型对应的筛选项列表数据
      templateList: [], //模版类型对应的筛选项列表数据
      extra: {} //其他额外增加的筛选类型对应的筛选项列表数据，对象中包含多个列表，每一个列表存放一种类型的筛选项数据
    };

    //传递给后台的筛选条件对象
    $scope.filterCondition = {
      workflow_status: $scope.workflowStatus.code,
      condition: '',
      template_code: '',
      extra: {} //存放额外筛选条件的code，如create_user_code、approve_status_code、chart_status_code
    };

    config();

    //配置页面元素
    function config() {
      if ($scope.type == 'todo') {
        $scope.workflowStatus = {
          code: baseConfig.workflow_todo,
          isTodo: true,
          isDone: false,
          isApply: false
        };
      } else if ($scope.type == 'done') {
        $scope.workflowStatus = {
          code: baseConfig.workflow_done,
          isTodo: false,
          isDone: true,
          isApply: false
        };
      } else if ($scope.type == 'apply') {
        $scope.workflowStatus = {
          code: baseConfig.workflow_apply,
          isTodo: false,
          isDone: false,
          isApply: true
        };
      } else {
        $scope.workflowStatus = {
          code: baseConfig.workflow_all,
          isTodo: false,
          isDone: false,
          isApply: false
        };
      }
      $scope.filterCondition.workflow_status = $scope.workflowStatus.code;

      $scope.pageNum = 1; //页码
      $scope.isLoadingData = false; //正在加载数据标志，初始化页面和刷新页面时使用
      $scope.isRefresh = false; //是否下拉刷新页面标志
      $scope.isRefreshingData = false; //判断是否是刷新页面导致的加载数据标志
      $scope.canLoadMoreData = false; //可否加载更多数据标志
      $scope.isLoadingMoreData = false; //正在加载更多数据标志

      $scope.list = []; //todo、done or apply列表数据
      $scope.currentItemIndex; //点击列表项进入明细页面时该项对应的索引，审批成功返回列表页面时去除列表项中审批完成的项时用到
    }

    //明细页面审批成功后返回列表页面时，从列表数据中去除对应的审批完成的单据(或者重新加载列表页面)
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if (toState.name == 'workflow-list' && fromState.name == 'workflow-detail') {
        if (workflowService.doWorkflowActionSuccess) {
          $scope.loadListData();
          // $scope.list.splice($scope.currentItemIndex, 1);
          workflowService.doWorkflowActionSuccess = false;
        }
      }
    });

    //加载列表数据
    $scope.loadListData = function (isRefresh) {
      if (isRefresh) {
        $scope.isRefresh = true;
      } else {
        $scope.isRefresh = false;
      }
      workflowService.getListData($scope);
    };

    //加载更多列表数据（上拉加载，分页显示，页码加1，调用loadListData）
    $scope.loadMoreListData = function () {
      workflowService.getMoreListData($scope);
    };

    //页面跳转获取选中待办事项
    $scope.goDetail = function (item, index) {
      if (!$scope.operable && $scope.type == 'todo') {
        item.selected = !item.selected;
        return;
      }
      $scope.currentItemIndex = index;
      $state.go('workflow-detail', {
        template_code: item.template_code,
        instance_id: item.instance_id,
        node_id: item.node_id,
        record_id: item.record_id
      });
    };

    //全选待办事项
    $scope.selectAll = function () {
      $scope.list.forEach(function (item) {
        item.selected = true;
      });
    };

    //拒绝选中待办事项
    $scope.reject = function () {
      workflowService.doWorkflowActionBatch($scope, baseConfig.refuse);
    };

    //通过选中待办事项
    $scope.allow = function () {
      workflowService.doWorkflowActionBatch($scope, baseConfig.approve);
    };

    //操作或者取消
    $scope.operableOrNot = function () {
      if (!$scope.operable) {
        //清空选中的待办事项
        $scope.list.forEach(function (item) {
          item.selected = false;
        });
      }
      $scope.operable = !$scope.operable;
    };

    $ionicModal.fromTemplateUrl('build/pages/workflow/modal/filter/hms-filter-modal.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.workflowFilterModal = modal;
    });

    $scope.openWorkflowFilterModal = function () {
      $scope.workflowFilterModal.show();
    };

    //数据筛选操作方法的对象
    $scope.dataFilterHandle = {
      cancelDataFilter: function () {
        $scope.workflowFilterModal.hide();
      },
      clearDataFilterParams: function () {
        $scope.workflowFilterModal.hide();
      },
      confirmDataFilter: function () {
        $scope.workflowFilterModal.hide();
        $ionicScrollDelegate.$getByHandle('workflowListHandle').scrollTop();
        $scope.loadListData();
      },
      selectFilterType: function (type) {
        angular.forEach($scope.filterTypeList, function (data) {
          data.selected = false;
        });
        type.selected = true;
        $ionicScrollDelegate.$getByHandle('hmsFilterCondition').scrollTop();
        $scope.filterConditionOption.currentCheckedType = type.typeCode;
        $scope.filterItemList = [];
        if (type.typeCode == 'SOURCE') {
          $scope.filterItemList = $scope.filterConditionOption.sourceList;
        } else if (type.typeCode == 'TEMPLATE') {
          //判断templateList数组是否为空，若为空获取模版数据，数据来源改变和初始化时为空
          if ($scope.filterConditionOption.templateList.length) {
            $scope.filterItemList = $scope.filterConditionOption.templateList;
          } else {
            workflowService.getTemplateList($scope);
          }
        } else {
          //将typeCode的_命名形式改成驼峰命名形式，并加上List结尾，组成存放额外筛选项的字段名
          var typeCode = type.typeCode.toLowerCase();
          var typeCodeCamel = typeCode.replace(/_(\w)/g, function (str) {
            return str.slice(1).toUpperCase();
          });
          var typeCodeList = typeCodeCamel + 'List';
          //判断extra对象中对应的筛选项数组是否为空，若为空获取对应的筛选项数据，数据来源改变和初始化时为空
          if ($scope.filterConditionOption.extra[typeCodeList].length) {
            $scope.filterItemList = $scope.filterConditionOption.extra[typeCodeList];
          } else {
            workflowService.getExtraCondition($scope, typeCode);
          }
        }
      },
      selectFilterItem: function (item) {
        angular.forEach($scope.filterItemList, function (data) {
          data.selected = false;
        });
        item.selected = true;
        if ($scope.filterConditionOption.currentCheckedType == 'SOURCE') {
          lastCheckedSource = workflowService.source;
          angular.forEach($scope.sourceList, function (data) {
            if (data.source_id == item.itemCode) {
              workflowService.source = data;
              return false;
            }
          });
          //判断数据来源是否改变，若改变重新获取列表数据
          if (lastCheckedSource != workflowService.source) {
            $scope.filterCondition.template_code = '';
            workflowService.getListData($scope);
            //数据来源改变，清空templateList和extra筛选项数据，以便重新获取对应来源的数据
            $scope.filterConditionOption.templateList = [];
            for (var typeCodeList in $scope.filterConditionOption.extra) {
              $scope.filterCondition.extra[typeCodeList] = [];
            }
            //数据来源改变，重置当前数据来源对应的筛选类型
            $scope.filterTypeList = [{
              typeCode: 'SOURCE',
              typeName: '数据来源',
              selected: true
            }, {
              typeCode: 'TEMPLATE',
              typeName: '工作流类型',
              selected: false
            }];
            angular.forEach(workflowService.source.condition, function (data) {
              var filterTypeItem = {
                typeCode: data.conditionTypeCode.toUpperCase(),
                typeName: data.conditionTypeName,
                selected: false
              };
              $scope.filterTypeList.push(filterTypeItem);
            });
          }
        } else if ($scope.filterConditionOption.currentCheckedType == 'TEMPLATE') {
          $scope.filterCondition.template_code = item.itemCode;
        } else {
          var extraTypeCode = $scope.filterConditionOption.currentCheckedType.toLowerCase() + '_code';
          $scope.filterCondition.extra[extraTypeCode] = item.itemCode;
        }
      }
    };

    loadData();

    //页面进入时加载数据
    function loadData() {
      // 如果页面有token或者用户名（不是第一次进入），有source源数据就直接用过source源数据获取接口地址加载数据，没有source源数据则获取源数据列表
      if (window.sessionStorage.token && window.sessionStorage.username) {
        if (workflowService.source) {
          $scope.loadListData();
        } else {
          workflowService.getSourceList($scope);
        }
      }
      // 页面没有token或没有用户名就获取token
      else {
        //workflowService.getToken($scope);
        workflowService.getListData($scope);
      }
    }

    $scope.toggleType = function (type) {
      if (!$scope.operable) {
        return;
      }
      //如果类型相同则不做处理
      if (type == $scope.type) {
        return;
      }
      $scope.operable = true;
      $scope.type = type;
      config();
      loadData();
    };

    //阻止ios上的页面弹性滚动，因为会造成ion-footer-bar上拉时底部黑屏
    if (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
      document.body.addEventListener('touchmove', function (e) {
        e.preventDefault();
      }, false);
    }

    //返回按钮
    $scope.goBack = function () {
      $ionicHistory.goBack();
    }
  }]);
