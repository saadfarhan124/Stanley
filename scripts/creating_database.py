import pandas
import numpy
import sqlite3
import warnings
from nltk.stem.snowball import SnowballStemmer
from ast import literal_eval
from pathlib import Path


class creating_database:
    def __init__(self, path):
        metadatacsv = Path('{}/MovieMetaData.csv'.format(path))
        if not metadatacsv.is_file():
            #removing warnings from code
            warnings.simplefilter('ignore')
            #loading data sources
            movieMetaData = pandas.read_csv('{}/Data/movies_metadatacopy.csv'.format(path), low_memory=False)
            links = pandas.read_csv('{}/Data/links.csv'.format(path))
            credits = pandas.read_csv('{}/Data/credits.csv'.format(path))
            #this is to replace all the other information in genres with only the name of those genres
            movieMetaData['genres'] = movieMetaData['genres'].fillna('[]').apply(literal_eval).apply(
                lambda x: [i['name'] for i in x] if isinstance(x, list) else []
            )
            #dropping ids that generate errors
            movieMetaData = movieMetaData.drop([19730, 29503, 35587])
            #conversion
            movieMetaData['id'] = movieMetaData['id'].astype('int')
            credits['id'] = credits['id'].astype(int)
            #merging movie meta data with keywords and credits
            movieMetaData = movieMetaData.merge(credits, on='id')
            links = links[links['tmdbId'].notnull()]['tmdbId'].astype('int')
            # filtering our dataset
            self.dataset = movieMetaData[movieMetaData['id'].isin(links)]
            # self.dataset = self.dataset.iloc[:7000]
            #normalizing dataset
            self.dataset['cast'] = self.dataset['cast'].apply(literal_eval)
            self.dataset['crew'] = self.dataset['crew'].apply(literal_eval)
            # setting director in dataframe
            self.dataset['director'] = self.dataset['crew'].apply(self.get_director)
            # getting the name of cast from datasource and then selecting only the top 3
            self.dataset['cast'] = self.dataset['cast'].apply(
                lambda x: [i['name'] for i in x] if isinstance(x, list) else [])
            self.dataset['cast'] = self.dataset['cast'].apply(lambda x: x[:3] if len(x) >= 3 else x)
            #normalizing cast
            self.dataset['cast'] = self.dataset['cast'].apply(lambda x: [str.lower(i.replace(' ', ''))for i in x])
            #getting director
            self.dataset['director'] = self.dataset['director'].astype(str).apply(lambda x: str.lower(x.replace(' ','')))
            self.dataset['director'] = self.dataset['director'].apply(lambda x: [x, x, x])
            self.dataset['soup'] = self.dataset['cast'] + self.dataset['director'] + self.dataset['genres']
            self.dataset['soup'] = self.dataset['soup'].apply(lambda x: ' '.join(x))
            self.dataset.to_csv('{}/MovieMetaData.csv'.format(path))

    #getting directors for movies from crew
    def get_director(self, x):
        for i in x:
            if i['job'] == 'Director':
                return i['name']
            return numpy.nan







