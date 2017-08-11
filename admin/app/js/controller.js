'use strict';
angular.module('app')
//Articles Controller
    .controller('ArticlesController', ['$scope', '$http', '$log', '$state', 'URLPREFIX', 'ArticlesService', 'PagerService', 'LoaderService', function ($scope, $http, $log, $state, URLPREFIX, ArticlesService, PagerService, LoaderService) {
        $scope.articles = [];
        $scope.pager = {};
        $scope.searchKeyword = '';

        $scope.setPage = function (page) {
            LoaderService.showLoader();
            ArticlesService.getArticles(URLPREFIX.url + URLPREFIX.articleURL + '/?page=' + page + '&search=' + $scope.searchKeyword + '&limit=10&offset=10')
                .then(function (res) {
                    LoaderService.hideLoader();
                    $scope.articles = res.data.result;
                    $scope.totalItems = res.data.length;
                    $scope.pager = PagerService.getPager(res.data.length, page, 10);
                    $scope.items = $scope.articles.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
                    $log.debug($scope.articles);
                }, function (err) {
                    LoaderService.hideLoader();
                    $log.debug(err);
                });
            if (page < 1 || page > $scope.pager.totalPages) {
                return;
            }
        }

        $scope.setPage(1);


        $scope.search = function (searchKeyword) {
            $scope.searchKeyword = searchKeyword;
            $scope.setPage(1);

        };
        $scope.deleteArticle = function (id) {
            ArticlesService.deleteArticle(URLPREFIX.url + URLPREFIX.articleURL + '/' + id)
                .then(function (res) {
                    $log.debug(res);
                    $state.reload();
                }, function (err) {
                    $log.debug(err);
                });
        };

        $scope.goToEditArticles = function (currentId) {
            $state.go('articles.edit', {id: currentId});
        };

        $scope.propertyName = 'id';
        $scope.reverse = true;
        $scope.sortBy = function (propertyName) {
            $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
            $scope.propertyName = propertyName;
        };
    }])

    //Add Article Controller
    .controller('AddArticleController', ['$scope', '$http', '$state', '$log', 'URLPREFIX', 'ArticlesService', function ($scope, $http, $state, $log, URLPREFIX, ArticlesService) {
        $scope.submit = function () {
            var data = {
                title: $scope.title,
                content: $scope.content
            };
            ArticlesService.putArticle(URLPREFIX.url + URLPREFIX.articleURL, data)
                .then(function (res) {
                    $log.debug(res);
                    $state.go('articles.index');
                }, function (err) {
                    $log.debug(err);
                });
        }
    }])

    //Edit Article Controller
    .controller('EditArticleController', ['$scope', '$http', '$state', '$log', '$stateParams', 'URLPREFIX', 'ArticlesService', function ($scope, $http, $state, $log, $stateParams, URLPREFIX, ArticlesService) {
        var id = $stateParams.id;

        ArticlesService.getArticle(URLPREFIX.url + URLPREFIX.articleURL, id)
            .then(function (res) {
                var article = res.data.result[0];
                $scope.data = {
                    id: id,
                    title: article.title,
                    content: article.content
                };
                $log.debug('get article for edit', article);
            }, function (err) {
                $log.debug(err);
            });
        $scope.submit = function () {
            ArticlesService.putArticle(URLPREFIX.url + URLPREFIX.articleURL, $scope.data)
                .then(function (res) {
                    $log.debug(res);
                    $state.go('articles.index');
                }, function (err) {
                    $log.debug(err);
                });
        }
    }])
