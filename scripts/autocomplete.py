import pandas
import sys
from getRecommendations import recommendation


path = sys.argv[1]
movieMetaData = pandas.read_csv('{}/MovieMetaData.csv'.format(path), nrows=100,   low_memory=False)
for title in movieMetaData['title']:
    title = title.encode()
    print(title)
print('done')
sys.stdout.flush()
