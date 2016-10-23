var task1 = angular.module('task1', []);

function humanReadableDate(value) {
	var dateString = new Date(value * 1000);
	var date = new Date(dateString);
	var yr = date.getFullYear();
	var mo = date.getMonth() + 1;
	var day = date.getDate();

	var hours = date.getHours();
	var hr = hours < 10 ? '0' + hours : hours;

	var minutes = date.getMinutes();
	var min = (minutes < 10) ? '0' + minutes : minutes;

	var seconds = date.getSeconds();
	var sec = (seconds < 10) ? '0' + seconds : seconds;

	var newDateString = yr + '-' + mo  + '-' + day;
	var newTimeString = hr + ':' + min + ':' + sec;

	var excelDateString = newDateString + ' ' + newTimeString;
	return excelDateString;
}

task1.factory('UserLocation', function ($rootScope, $q) {
	var UserLocation = function (args) {
		
		this.args = args || {};

		this.get = function() {
			var deferred = $q.defer();
			if (navigator.geolocation) {
			    navigator.geolocation.getCurrentPosition(function(data){
			    	deferred.resolve(data);
			    }, function (error) {
			    	deferred.reject(error);
			    });
			} else {
			    deferred.reject("Geolocation is not supported by this browser.");
			}
			return deferred.promise;
		}
	}

	return new UserLocation();
});
task1.factory('UserLocationWeather', function ($rootScope, $q, $http) {
	var UserLocationWeather = function (args) {
		this.url 			= 'http://api.openweathermap.org/data/2.5/weather?APPID=5d22007685e8c39cb206c578b7d14d99&units=metric';
		
		this.get = function(args) {
			var deferred = $q.defer();
			var query = '';
			if(typeof args.latitude !== 'undefined' && typeof args.longitude !== 'undefined'){
				query = '&lat='+args.latitude+'&lon='+args.longitude;
			}else{
				if(typeof args.zip !== 'undefined')
					query = '&zip='+args.zip;

				if(typeof args.countryCode !== 'undefined')
					query += ','+args.countryCode;
			}

			

			$http.get(this.url+query)
			.then(function (response) {
				response.data.sys.sunrise 	= humanReadableDate(response.data.sys.sunrise);
				response.data.sys.sunset 	= humanReadableDate(response.data.sys.sunset);
				deferred.resolve(response);
			},function (error) {
				deferred.reject(error);
			});
			
			return deferred.promise;
		}
	}

	return new UserLocationWeather();
});
task1.controller('HomeCtrl', function ($scope, UserLocation, UserLocationWeather, $http) {
	
	$scope.showForm = false;
	$scope.Math = window.Math;

	$scope.getWeather = function(object) {
		UserLocationWeather.get(object)
		.then(function (response) {
			$scope.showForm = false;
			$scope.weather = response.data;

			console.log(response.data);
			
		}, function (error) {
			console.log(error)
		});		
	}

	UserLocation.get().then(function (data) {
		$scope.position = data;
		$scope.getWeather({latitude : $scope.position.coords.latitude, longitude : $scope.position.coords.longitude});
		
	},function (error) {
		
		$http.get('assets/js/countries.json').then(function (response) {
			
			$scope.countries = response.data;
			$scope.showForm = true;
		}, function(err){
			console(err)
		});

	});

	// According to the task User must enter Country OR Postcode
	// There are countries with the same postcode
	// eg postcode 400005 is shared by 1) Cluj-Napoca - Romania, 2) Volgograd - Russia 3) Mumbai - India
	$scope.setLocation = function (countryCode, zip) {

		if(typeof zip !== 'undefined' && zip != null && zip != ''){
			$scope.disabled = true;
			$scope.showError = false;
			$scope.getWeather({countryCode : countryCode, zip : zip});
		}

		if(zip == null)
			$scope.showError = 'You must enter postcode';
	}

	$scope.toDate = function(value) {
		return new Date(value)
	}

	$scope.getIcon = function(icon) {
		
        if (icon == "01d") {
            return "wi-day-sunny";
        }
        else if (icon == "02d") {
            return "wi-day-cloudy"
        }
        else if (icon == "03d") {
            return "wi-cloud"
        }
        else if (icon == "04d") {
            return "wi-cloudy";
        }
        else if (icon == "09d") {
            return "wi-rain";
        }
        else if (icon == "10d") {
            return "wi-day-rain";
        }
        else if (icon == "11d") {
            return "wi-thunderstorm";
        }
        else if (icon == "13d") {
            return "wi-snow";
        }
        else if (icon == "50d") {
            return "wi-fog";
        }
        else if (icon == "01n") {
            return "wi-night-clear"
        }
        else if (icon == "02n") {
            return "wi-night-cloudy"
        }
        else if (icon == "03n") {
            return "wi-cloud"
        }
        else if (icon == "04n") {
            return "wi-cloudy";
        }
        else if (icon == "09n") {
            return "wi-rain";
        }
        else if (icon == "10n") {
            return "wi-night-rain";
        }
        else if (icon == "11n") {
            return "wi-thunderstorm";
        }
        else if (icon == "13n") {
            return "wi-snow";
        }
        else if (icon == "50n") {
            return "wi-fog";
        }
	}

});