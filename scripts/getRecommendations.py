from sklearn.feature_extraction.text import CountVectorizer,TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from creating_database import creating_database
from random import *
import pandas
import warnings
import sqlite3
import sys


class recommendation:
    def __init__(self, path, username):
        warnings.simplefilter('ignore')
        creating_database(path)
        self.movieMetaData = pandas.read_csv('{}/MovieMetaData.csv'.format(path), nrows=100,  low_memory=False)
        count = CountVectorizer(analyzer='word',  stop_words='english')
        count_matrix = count.fit_transform(self.movieMetaData['soup'])
        #create an array of pairwise similarity between movies with movie id as
        #index value array includes [(movieid),(similarityscore)]
        self.cosine_sim = linear_kernel(count_matrix, count_matrix)
        self.movieMetaData = self.movieMetaData.reset_index()
        self.titles = self.movieMetaData['title']
        self.indices = pandas.Series(self.movieMetaData.index, index=self.movieMetaData['title'])
        self.username = username


    def get_recommendation(self, title):
        index = self.indices[title]
        #recives the movies similar to the title based on the movie id
        similarity_score = list(enumerate(self.cosine_sim[index]))
        #the list is sorted according to similarity score as x[1] = sim score while x[0] = movie title
        similarity_score = sorted(similarity_score, key= lambda x: x[1], reverse=True)
        #the index starts from first since the most similar movie
        #to a movie would be itself
        similarity_score = similarity_score[1:40]
        movie_indices = [i[0] for i in similarity_score]
        #calculating the popularity of recommended movies based on imdb's formula
        #Weighted Rating = ((v/(v+m)R)+(m/(v+m))C)
        #where v = number of votes for movie
        #m = minimum number of votes required
        #R = average rating of movie
        #C = mean vote across the entire list
        movies = self.movieMetaData.iloc[movie_indices][['title', 'vote_count', 'vote_average','imdb_id', 'genres']]
        vote_counts = movies[movies['vote_count'].notnull()]['vote_count'].astype(int)
        vote_average = movies[movies['vote_average'].notnull()]['vote_average'].astype(int)
        self.C = vote_average.mean()
        self.m = vote_counts.quantile(0.60)
        self.qualified = movies[(movies['vote_count'] >= self.m) & (movies['vote_count'].notnull()) &
                           (movies['vote_average'].notnull())]
        self.qualified['vote_count'] = self.qualified['vote_count'].astype(int)
        self.qualified['vote_average'] = self.qualified['vote_average'].astype(int)
        self.qualified['weighted_rating'] = self.qualified.apply(self.weighted_rating,axis=1)
        self.qualified = self.qualified.sort_values('weighted_rating', ascending=False)
        return self.qualified

    def weighted_rating(self,x):
        v = x['vote_count']
        R = x['vote_average']
        return (v/(v+self.m) * R) + (self.m/(self.m+v) * self.C)


    def get_watched_list(self):
        with sqlite3.connect('../Stanley.db') as conn:
            cursor = conn.cursor()
            cursor.execute('Select userid from user where username = "{}"'.format(self.username))
            userid = cursor.fetchone()[0]
            cursor.execute('Select movie_title from favorite_movies where userid = {} and score > 7'.format(
                userid
            ))
            return cursor.fetchall()


if __name__ == '__main__':
    test, path, username, genre = sys.argv
    if genre == '2':
        rec = recommendation(path, username)
        watched_list = rec.get_watched_list()
        if len(watched_list) > 0:
            result = pandas.DataFrame()
            for movietitle in watched_list:
                recommendation_list = rec.get_recommendation(movietitle[0])
                result = result.append(recommendation_list)
            for movietitle in watched_list:
                result = result[result.title != movietitle[0]]
            if len(result) > 6:
                avg = int(len(result)/2)
                min = randint(0, avg)
                max = randint(avg+1, len(result))
                result = result.iloc[min : max]
            for movie in result['imdb_id'].head(6):
                print(movie)
        else:
            print('false')
    else:
        rec = recommendation(path, username)
        watched_list = rec.get_watched_list()
        if len(watched_list) > 0:
            result = pandas.DataFrame()
            for movietitle in watched_list:
                recommendation_list = rec.get_recommendation(movietitle[0])
                result = result.append(recommendation_list)
            for movietitle in watched_list:
                result = result[result.title != movietitle[0]]
            result.drop_duplicates(subset=['imdb_id'],inplace=True)
            counter = 0
            for movie, gen in zip(result['imdb_id'], result['genres']):
                if counter < 6:
                    if genre in gen:
                        print(movie)
                        counter += 1
                else:
                    pass
        else:
            print('false')
    sys.stdout.flush()