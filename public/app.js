angular.module('eventManager',['dndLists'])

.factory('eventManagerService', ['$http', function($http){

    var _getRegistrants = function(){
        return $http.get("/", {})
    };
    var _deleteRegistrant = function(toDel){
        return $http.delete("/"+toDel, {})
    };
    var _addRegistrant = function(_toAdd){
        var _serializedData = $.param(_toAdd);
        return $http({
            url: "/",
            method: "POST",
            data: _serializedData,
            headers: {'Content-Type': "application/x-www-form-urlencoded"}
        })
    };

    return {
        addRegistrant : _addRegistrant,
        getRegistrants : _getRegistrants,
        deleteRegistrant : _deleteRegistrant
    }

}])

.controller('eventController', ['$scope', 'eventManagerService', '$timeout', function($scope, eventManagerService, $timeout){
    $scope.personAdded = false;
    $scope.removed = false;
    eventManagerService.getRegistrants().then(function success(response) {
        $scope.registrants = response.data.guests;
        if($scope.registrants.length == 0){
            $scope.empty = true;
        }
    }, function error(response) {
        console.log(response);
    });

    $scope.addAttendee = function(){
        if($scope.enteredEmail === undefined || $scope.enteredName === undefined){
            return
        }

        var addMe = {
            name: $scope.enteredName,
            email: $scope.enteredEmail
        };
        eventManagerService.addRegistrant(addMe).then(function success(response){
            $scope.added = "Thank you for registering, "+$scope.enteredName+"!";
            $scope.personAdded = true;
            $scope.registrants.push(addMe);
            $scope.empty = false;
            $timeout(function(){
                $scope.personAdded = false;
                $scope.added = null;
                $scope.enteredName = undefined;
                $scope.enteredEmail = undefined;
            }, 2000)

        }, function error(response){

        });
        $timeout(function(){$scope.$apply()});
    }
    $scope.removeAttendee = function($event) {
        var email = $event.target.parentNode.id;
        eventManagerService.deleteRegistrant(email).then(function success(response) {
            var removed = null;
            for (var i = 0; i < $scope.registrants.length; i++) {
                if ($scope.registrants[i].email === email) {
                    removed = $scope.registrants.splice(i, 1);
                    break;
                }
            }
            $scope.removedName = removed[0].name + " has been removed from your event";
            $scope.removed = true;
            if($scope.registrants.length == 0){
                $scope.empty = true;
            }
            $timeout(function () {
                $scope.removed = false;
                $scope.removedName = undefined;
            }, 2000)
        }, function error(response) {

        });
    }
    $scope.$watch('registrants', function(nu, ol){
        if(nu !== undefined && nu.length == 0){
            $scope.empty = true;
        }
        else{
            $scope.empty = false;
        }
        $timeout(function(){$scope.$apply()});
    })

}])

