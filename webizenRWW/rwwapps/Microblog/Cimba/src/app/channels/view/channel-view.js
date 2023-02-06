
angular.module('Cimba.channels.view', ['ui.router'])

.config(function ChannelsConfig($stateProvider) {
    $stateProvider.state('view', {
        url: '/channels/view/*path', 
        views: {
            'main': {
                controller: 'ChannelViewCtrl',    
                templateUrl: 'channels/view/channel-view.tpl.html'
            }
        },
        data: {}
    });
})

.controller('ChannelViewCtrl', function ChannelViewController($scope, $stateParams, $location, $http, noticesData) {    
    //console.log("channel view ctrl"); //debug

    //put the post data that is saved in local storage into the posting text box
    if(sessionStorage.getItem($scope.$parent.postData[$scope.currentUrl])&&sessionStorage.getItem($scope.$parent.postData[$scope.currentUrl])!='undefined'){
        $scope.postbody = sessionStorage.getItem($scope.$parent.postData[$scope.currentUrl]);
    }else{
        $scope.postbody = '';
    }
    $scope.path = $stateParams.path;
    $scope.currentUrl = $location.absUrl();    

    $scope.safeUri = function (uri) {
        return uri.replace(/^https?:\/\//,'');
    };    

    var webid = $scope.$parent.userProfile.webid;
    $scope.chanUri = "https://" + $scope.path;
    if($scope.channels[$scope.chanUri]) {
        console.log("found");
        var ch = $scope.channels[$scope.chanUri];
        $scope.$parent.getPosts(ch.uri, ch.title);
    } else if ($scope.userProfile.channels[$scope.chanUri]) {
        $scope.channels[$scope.chanUri] = $scope.userProfile.channels[$scope.chanUri];
        var ch2 = $scope.channels[$scope.chanUri];
        $scope.$parent.getPosts(ch2.uri, ch2.title);
    } else {
        console.log("not found");
        $scope.$parent.getChannel($scope.chanUri);
    }

    //save what is currently in the new post text box to local storage
    $scope.savePostData=function(postBody){
        var currentPost = postBody;
        sessionStorage.setItem($scope.$parent.postData[$scope.currentUrl], currentPost, $scope.currentUrl);
    };

    //clears post data from local storage
    $scope.clearPostData=function(){
        sessionStorage.removeItem($scope.$parent.postData[$scope.currentUrl]);        
    };
    
})

.directive('listPosts', function () {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'channels/view/posts.tpl.html'
    };
});