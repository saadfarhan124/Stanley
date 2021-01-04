import pandas
import sys




movieMetaData = pandas.read_csv('MovieMetaData.csv', nrows=100,   low_memory=False)
movieMetaData.dropna(inplace=True)
movieMetaData = movieMetaData.loc[1:]
count = 0
for title in movieMetaData['director'].unique():
    if count == 0:
        count = count + 1
        continue
    else:
        print(title.split("'")[1])

print('done')
sys.stdout.flush()
