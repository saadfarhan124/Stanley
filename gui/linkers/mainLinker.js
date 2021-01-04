
let { ipcRenderer } = require('electron');
let { PythonShell } = require('python-shell');
let options = {
    mode: 'text', scriptPath: path.join(__dirname, '/../scripts/'),
    pythonPath: PYTHON_PATH,
};

window.login = function () {
    document.querySelector('.loader').style.display = 'block';
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    options.args = [username, password];
    let login = new PythonShell('login.py', options);
    login.on('message', function (message) {
        if (message === 'True') {
            ipcRenderer.sendSync('synchronous-message', username)
        } else {
            M.toast({ html: 'Invalid username or password', classes: 'toast' }).timeRemaining = 1250;
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        }
    })
    login.on('close', function () {
        document.querySelector('.loader').style.display = 'none';
    });
}

window.changePassword = function (oldpass, newpassword) {
    // [storage.getItem('username')
    options.args = [storage.getItem('username'), oldpass, newpassword];
    let changePassword = new PythonShell('changePassword.py', options);
    changePassword.on('message', function (message) {
        M.toast({ html: message, classes: 'toast' }).timeRemaining = 1250;
    });
    changePassword.on('close', function () {
        document.querySelector('.loader').style.display = 'none';
    });
}

window.forgotPass = function () {
    options.args = [document.getElementById('email').value]
    document.querySelector('.loader').style.display = 'block';
    let forgotPassword = new PythonShell('forgotPassword.py', options);
    forgotPassword.on('message', function (message) {
        if (message != 'false') {
            M.toast({ html: message, classes: 'toast' }).timeRemaining = 1250;
            document.getElementById('email').value = document.getElementById('confirmemail').value =
                document.getElementById('message').innerHTML = '';
        } else {
            M.toast({ html: 'No user registered with this email', classes: 'toast' }).timeRemaining = 1250;
            document.getElementById('email').value = document.getElementById('confirmemail').value =
                document.getElementById('message').innerHTML = '';
        }
    });
    forgotPassword.on('close', function () {
        document.querySelector('.loader').style.display = 'none';
    });
}

window.addMovieToWatchList = function (movieName, movieScore) {
    options.args = [storage.getItem('username'), movieName, movieScore]
    let addMovieToWatchedList = new PythonShell('addMovieToWatchList.py', options);
    addMovieToWatchedList.on('message', function (message) {
        if (message == 'false') {
            M.toast({ html: 'Movie already exists!', classes: 'toast' }).timeRemaining = 1250;

        } else {
            M.toast({ html: 'Movie Added!', classes: 'toast' }).timeRemaining = 1250;
        }
    });
    addMovieToWatchedList.on('close', function () {
        document.querySelector('.loader').style.display = 'none';
    })
}

var movies = [];
window.getRecommendations = function () {
    let row = document.getElementById('row');
    while (row != null) {
        $('#row').remove();
        row = document.getElementById('row');
    }
    if (document.getElementById('mainhead') != null) {
        $('#mainhead').remove();
    }
    let genreSelect = document.getElementsByClassName('select-dropdown')[0].value;
    if (genreSelect.indexOf('Choose') >= 0 || genreSelect.indexOf('Show') >= 0) {
        options.args = [path.join(__dirname, '/../scripts/'), storage.getItem('username'), "2"];
    } else {
        console.log('dasdasdas')
        options.args = [path.join(__dirname, '/../scripts/'), storage.getItem('username'), genreSelect];
    }
    let getRecommendations = new PythonShell('getRecommendations.py', options);
    getRecommendations.on('message', function (message) {
        if (message == 'false') {
            M.toast({ html: 'No movies exists in the users watched list with score more than 7', classes: 'toast' }).timeRemaining = 1250;
        } else {
            movies.push(message);
        }
    });
    getRecommendations.on('close', function () {
        getRecommendation();
    });

}

window.getUpdates = function () {
    let row = document.getElementById('row');
    if (row != null) {
        while (row != null) {
            $('#row').remove();
            row = document.getElementById('row');
        }
    }
    if (document.getElementById('mainhead') != null) {
        $('#mainhead').remove();
    }
    getMovieUpdates();
    document.querySelector('.loader').style.display = 'none';
}


//Function to create movie cards
function movie_cards(response, apikey) {
    let card_small = document.createElement('div');
    card_small.className = 'card';
    card_small.className += ' small';
    let card_image = document.createElement('div');
    card_image.className = 'card-image';
    card_image.className += ' waves-effect';
    card_image.className += ' waves-block ';
    card_image.className += ' waves-light';
    let image = document.createElement('img')
    image.className = 'activator';
    let basePosterPath = 'http://image.tmdb.org/t/p/w200'
    image.src = basePosterPath.concat(response['movie_results'][0]['poster_path']);
    card_image.append(image);
    card_small.append(card_image);
    let card_content = document.createElement('div');
    card_content.className = 'card-content';
    let card_title = document.createElement('span');
    card_title.className = 'card-title';
    card_title.className += ' grey-text';
    card_title.className += ' text-darken-4';
    card_title.innerHTML = response['movie_results'][0]['original_title'];
    card_content.append(card_title);
    card_small.append(card_content);
    let card_reveal = document.createElement('div');
    card_reveal.className = 'card-reveal';
    let card_reveal_title = document.createElement('span');
    card_reveal_title.className = 'card-title';
    card_reveal_title.className += ' card-reveal-title'
    card_reveal_title.innerHTML = response['movie_results'][0]['original_title'];
    let film_info = document.createElement('p');
    film_info.className = 'description';
    film_info.innerHTML = response['movie_results'][0]['overview'];
    let film_genre = document.createElement('p');
    film_genre.innerHTML = "";
    film_id = response['movie_results'][0]['id'];
    let url = "".concat("https://api.themoviedb.org/3/movie/", film_id, '?api_key=', apikey);
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.open('GET', url);
    xhr.send();
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState == this.DONE) {
            this.response["genres"].forEach(function (item) {
                film_genre.innerHTML += " ".concat(item["name"])
            })
        }
    })
    card_reveal.append(card_reveal_title);
    card_reveal.append(film_info);
    card_reveal.append(film_genre);
    card_small.append(card_reveal);
    return card_small;
}

function getRecommendation() {
    const apikey = 'c3319c9dec1785e26c258ef85677996f';
    let content = document.getElementById('content');
    let heading = document.createElement('h3');
    heading.className = 'center ';
    heading.id = 'mainhead';
    heading.innerHTML = 'Recommendations';
    content.append(heading);
    var baseUrl = 'https://api.themoviedb.org/3/find/';
    let count = 2;
    movies.forEach(function (item) {
        let url = "".concat(baseUrl, item, '?api_key=', apikey, '&language=en-US&external_source=imdb_id');
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.responseType = 'json';
        xhr.open('GET', url);
        xhr.send();
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === this.DONE) {
                count += 1;
                if (count % 2 != 0) {
                    let row = document.createElement('div');
                    row.className = 'row';
                    row.id = 'row';
                    let columns = document.createElement('div');
                    columns.className = 'col s6';
                    let card_small = movie_cards(this.response, apikey);
                    columns.append(card_small);
                    row.append(columns);
                    content.append(row);
                    $(function () {
                        $('.card').hover(
                            function () {
                                $(this).find('> .card-image > img.activator').click();
                            }, function () {
                                $(this).find('> .card-reveal > .card-title').click();
                            }
                        );
                    });
                } else {
                    let row = document.getElementById('content').lastChild;
                    let columns = document.createElement('div');
                    columns.className = 'col s6';
                    let card_small = movie_cards(this.response, apikey);
                    columns.append(card_small);
                    row.append(columns);
                    content.append(row);
                    $(function () {
                        $('.card').hover(
                            function () {
                                $(this).find('> .card-image > img.activator').click();
                            }, function () {
                                $(this).find('> .card-reveal > .card-title').click();
                            }
                        );
                    });
                }
            }

        });
    });
    document.querySelector('.loader').style.display = 'none';
}

function updates_movie_cards(item) {
    let card_small = document.createElement('div');
    card_small.className = 'card';
    card_small.className += ' small';
    let card_image = document.createElement('div');
    card_image.className = 'card-image';
    card_image.className += ' waves-effect';
    card_image.className += ' waves-block ';
    card_image.className += ' waves-light';
    let image = document.createElement('img')
    image.className = 'activator';
    let basePosterPath = 'http://image.tmdb.org/t/p/w200'
    image.src = basePosterPath.concat(item['poster_path']);
    card_image.append(image);
    card_small.append(card_image);
    let card_content = document.createElement('div');
    card_content.className = 'card-content';
    let card_title = document.createElement('span');
    card_title.className = 'card-title';
    card_title.className += ' grey-text';
    card_title.className += ' text-darken-4';
    card_title.innerHTML = item['original_title'];
    card_content.append(card_title);
    card_small.append(card_content);
    let card_reveal = document.createElement('div');
    card_reveal.className = 'card-reveal';
    let card_reveal_title = document.createElement('span');
    card_reveal_title.className = 'card-title';
    card_reveal_title.className += ' card-reveal-title'
    card_reveal_title.innerHTML = item['original_title'];
    let film_info = document.createElement('p');
    film_info.innerHTML = item['overview'];
    let film_genre = document.createElement('p');
    film_genre.innerHTML = "";
    film_id = item['id'];
    let url = "".concat("https://api.themoviedb.org/3/movie/", film_id, '?api_key=', "c3319c9dec1785e26c258ef85677996f");
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.open('GET', url);
    xhr.send();
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState == this.DONE) {
            this.response["genres"].forEach(function (item) {
                film_genre.innerHTML += " ".concat(item["name"])
            })
        }
    })
    card_reveal.append(card_reveal_title);
    card_reveal.append(film_info);
    card_reveal.append(film_genre);
    card_small.append(card_reveal);
    return card_small;
}

function getMovieUpdates() {
    let content = document.getElementById('content');
    let heading = document.createElement('h3');
    heading.className = 'center';
    heading.id = 'mainhead';
    heading.innerHTML = 'New Movies';
    content.append(heading);
    let url = "https://api.themoviedb.org/3/movie/popular?api_key=c3319c9dec1785e26c258ef85677996f&language=en-US&page=1"
    let count = 2;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.open('GET', url);
    xhr.send();
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            popularMovieList = this.response["results"].slice(0, 6);
            popularMovieList.forEach(function (item) {
                count += 1;
                if (count % 2 != 0) {
                    let row = document.createElement('div');
                    row.className = 'row';
                    row.id = 'row';
                    let columns = document.createElement('div');
                    columns.className = 'col s6';
                    let card_small = updates_movie_cards(item);
                    columns.append(card_small);
                    row.append(columns);
                    content.append(row);
                    $(function () {
                        $('.card').hover(
                            function () {
                                $(this).find('> .card-image > img.activator').click();
                            }, function () {
                                $(this).find('> .card-reveal > .card-title').click();
                            }
                        );
                    });
                } else {
                    let row = document.getElementById('content').lastChild;
                    let columns = document.createElement('div');
                    columns.className = 'col s6';
                    let card_small = updates_movie_cards(item);
                    columns.append(card_small);
                    row.append(columns);
                    content.append(row);
                    $(function () {
                        $('.card').hover(
                            function () {
                                $(this).find('> .card-image > img.activator').click();
                            }, function () {
                                $(this).find('> .card-reveal > .card-title').click();
                            }
                        );
                    });
                }
            })
        }
    });
    document.querySelector('.loader').style.display = 'none';
}

window.moviePlaying = function (path) {
    storage.setItem('path', path);
    ipcRenderer.sendSync('synchronous-message', 'play')
}
