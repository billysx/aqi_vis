import pandas as pd
import os 
import csv
year = ["2014","2015","2016","2017","2018","2019"]
year = ["2019"]
lst = os.listdir()
t = -1
lst=["20190101-20191130"]
for dir in lst:
	t=t+1
	filelst = os.listdir(dir)
	csvFile = open(os.path.join("aqi"+year[t]+"_hourly.csv"),"w",newline="")
	csvFile2 = open(os.path.join("aqi"+year[t]+"_daily.csv"),"w",newline="")

	writer = csv.writer(csvFile)
	writer2 = csv.writer(csvFile2)
	writer.writerow(["date","hour","shanghai","beijing","guangzhou","shenzhen"]) 
	writer2.writerow(["date","shanghai","beijing","guangzhou","shenzhen"]) 
	print(t,year[t])

	for file in filelst:
		quality = pd.read_csv(os.path.join(dir,file))
		quality.fillna(0,inplace=True)
		s = [0,0,0,0]
		n = [0,0,0,0]

		# date = quality.loc[0,"date"]
		for j in range(0,quality.shape[0],15):

			row = []
			row.append(quality.loc[j,"date"])
			row.append(quality.loc[j,"hour"])
			row.append(quality.loc[j,"上海"])
			row.append(quality.loc[j,"北京"])
			row.append(quality.loc[j,"广州"])
			row.append(quality.loc[j,"深圳"])
			for i in range(4):
				n[i]+=1
				s[i]+=row[2+i]

			writer.writerow(row)

		row2 = []
		row2.append(quality.loc[0,"date"])
		k1 = 0
		if n[0]!=0:
			k1 = s[0]/n[0]
		k2 = 0
		if n[1]!=0:
			k2 = s[1]/n[1]
		k3 = 0
		if n[2]!=0:
			k3 = s[2]/n[2]
		k4 = 0
		if n[3]!=0:
			k4 = s[3]/n[3]
		row2.append(k1)
		row2.append(k2)
		row2.append(k3)
		row2.append(k4)
		writer2.writerow(row2)





