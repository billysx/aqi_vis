	var height = 300;
	var width = 300;
	var maxneighbor = 500;

	var barlength = [0,50,100,150,200,300,500];
	var colorchart = ["#43ce17", "#efdc31", "#fa0",
						'#ff401a','#d20040','#9c0a4e',"#660066"]
	var quality = ['优','良','轻度污染','中度污染','重度污染','严重污染']
	var ComputeColor = [];
	
	var aqi2015 = [];
	
	var colorScale = {
		beijing:"red",
		shanghai:"blue",
		guangzhou:"purple",
		shenzhen:"green",
	};
	var offset = {
		beijing:20,
		shanghai:50,
		guangzhou:80,
		shenzhen:110,
	}
	
	

function display(cityname){
	$("svg").remove();
	var svga = d3.select("body")
				.append("svg")
				.attr("height",1200)
				.attr("width",1300);
	// left color bar
	var tooltip = d3.select('body').append('div')
	    .attr('class', 'tooltip')
	    .style('opacity', 0);
	
	// function activated when mouseover the pie
	function showTooltip(d) {
		//console.log("aaahah",d)
		var year = Math.floor(d.yearmonth/100);
		var month =d.yearmonth%100;
		var j;
		for (j=0;j<=5;++j){
			if(d[cityname]<=barlength[j+1])
				break;
		}
	    var tooltip_msg = `<p> ${year}.${month}.${d.day}<br>
							AQI: ${d[cityname]}<br>
							空气质量:${quality[j]}
							</p>`;
	    tooltip.style('opacity', 0.8);
	    tooltip.html(tooltip_msg).style('left', (d3.event.pageX) + 'px').style('top', (d3.event.pageY) + 'px');
	}
	
	function hideTooltip() {
	    tooltip.style('opacity', 0);
	}
	for (let i=0;i<=5;++i){
		var g1=svga.append("g")
		    .attr("width", width)
		    .attr("height", height)
		    .attr("id", "g"+i)
			
		let linear = d3.scaleLinear().domain([barlength[i], barlength[i+1]]).range([0, 1]);
		let compute = d3.interpolate(colorchart[i], colorchart[i+1]);
		//console.log(compute)
		ComputeColor.push(compute)
		colorheight = 1.1;
		colorwidth = 20;
		g1.selectAll('rect').data(d3.range(barlength[i], barlength[i+1])).enter()
			.append('rect')
			.attr("id",function(d){
				return "rect"+d;
			})
			.attr('x', 0)
			.attr('y', (d,i) => 25 + i * colorheight)
			.attr('width', colorwidth)
			.attr('height', colorheight)
			.style('fill', (d,i) => compute(linear(d)))
			.attr("transform",`translate(${70},${barlength[i]*colorheight})`);
		k=40
		if(i==0)k+=20
		if(i==1)k+=10;
		g1.append("text")
			.text(barlength[i])
			.attr("font-size","13px")
			.attr("x",k)
			.attr("y",(barlength[i])*colorheight+30);
	}
	g1.append("text")
		.text(barlength[6])
		.attr("font-size","13px")
		.attr("x",k)
		.attr("y",barlength[6]*colorheight+30);
		
		
		
		
		
		
	// load data in
	for (let time=2014;time<=2016;time++){
		csvstr = "data/daily/aqi"+time+"_daily.csv"
		d3.csv(csvstr)
			.then(function(d){
				aqi2015 = [];
				days = d.length;
				for (let i=0; i<days; ++i){
					intDay = parseInt(d[i]["date"]);
					yearmonth = Math.floor(intDay/100);
					day = intDay%100;
					//console.log(i)
					aqi2015.push({
						yearmonth:yearmonth,
						day:day,
						beijing:parseInt(d[i]["beijing"]),
						shanghai:parseInt(d[i]["shanghai"]),
						guangzhou:parseInt(d[i]["guangzhou"]),
						shenzhen:parseInt(d[i]["shenzhen"]),
					});
				}
				
				var flag = new Array();
				var monthaqi = new Array();
				var valid = new Array();
				var monthname = new Array();
				
				
				var squareWidth = 15;
				var squareHeight = 15;
				var offset15x = 150;
				var offset15y = 10+((time-2014)*squareWidth)*12.3;
				var g2015=svga.append("g")
					    .attr("width", 600)
					    .attr("height", 600)
						.attr("id","aqis")
						
					g2015.selectAll('rect')
						.data(aqi2015)
						.enter()
						.append('rect')
						.attr("id",function(d){
							flag[d["yearmonth"]]=1;
							monthaqi[d["yearmonth"]]=0;
							valid[d["yearmonth"]]=0;
							return "aqi"+d["yearmonth"]+d["day"];
	
						})
						.attr("class","aqi")
						.attr('x', d => squareWidth *d["day"] + offset15x)
						.attr('y', d => squareHeight*(d["yearmonth"]%100) + offset15y)
						.attr('width', squareWidth)
						.attr('height', squareHeight)
						.style('fill', function(d,i){
							if(d[cityname]!=0){
								monthaqi[d["yearmonth"]]+=d[cityname];
								valid[d["yearmonth"]]+=1;
								monthname[d["yearmonth"]]=1;
							}
							if(flag[d["yearmonth"]]==1){
								g2015.append("text")
									.text(d["yearmonth"])
									.attr("font-size","13px")
									.attr("x",d => offset15x-40)
									.attr("y",squareHeight*(d["yearmonth"]%100) + offset15y+12);
								flag[d["yearmonth"]]=0;
							}
							
							var aqi = d[cityname];
							if(aqi==0){
								return "white";
							}
							let j;
							for (j=0;j<=6;++j){
								if(aqi<=barlength[j+1])
									break;
							}
							//console.log(aqi,j);
							let linear = d3.scaleLinear().domain([barlength[j], barlength[j+1]]).range([0, 1]);
							let compute = d3.interpolate(colorchart[j], colorchart[j+1]);
							let compute2 = ComputeColor[j];
							var color = compute2(linear(aqi));
							return color;
						}).on("mouseover",function(d){
							d3.select(this).style("stroke-width","2");
							d3.select(this).style("stroke","black");
							d3.select(this).style("cursor","pointer");
							d3.select(this.parentNode).raise();
							setTimeout(showTooltip(d), 1000);
							for (let i=0;i<=500;++i){
								if (i!=d[cityname]){
									d3.selectAll("#rect"+i).attr("opacity",0.2)
								}
							}
						}).on("mouseout", function(d,i) {
						  d3.select(this.parentNode).lower();
						  d3.select(this).style("stroke-width","0");
						  setTimeout(hideTooltip(), 1000);
						  for (let i=0;i<=500;++i){
						  		d3.selectAll("#rect"+i).attr("opacity",1)
						  }
						})	
				if(time==2014){
					
					for (let i=1;i<=31;++i){
						g2015.append("text")
							.text(i)
							.attr("font-size","11px")
							.attr("x",function() {
								var ans = offset15x+i*squareWidth
								if (i<=9)
									ans+=4
								return ans;
							})
							.attr("y",20);
						flag[d["yearmonth"]]=0;
					}
				}
				
				
				g2015.append("rect")
					.attr("x",1125)
					.attr("y",45+190*(time-2014)+offset[cityname])
					.attr("width",20)
					.attr("height",2)
					.attr("fill",colorScale[cityname]);
				g2015.append("text")
					.attr("x",1150)
					.attr("y",50+190*(time-2014)+offset[cityname])
					.text(cityname)
				// form data
					dataset = [];
					dataset.push(new Array());
					dataset[0]["data"]=[];
					var n = 0;
					if (time==2014)
						n = 4;
					for (var key in monthname){
						n=n+1;
						var mystr = key;
						var res = 0;
						if (valid[mystr]!=0)
							res = Math.floor(monthaqi[mystr]/valid[mystr]);
					
						dataset[0]["data"].push({
							id:n,
							aqi:res,
						})
					}
					
					var xScale=d3.scaleLinear()
								.domain([1,12])
								.range([0,400]);
					//console.log(d3.min(dataset))
					var yScale=d3.scaleLinear()
								.domain([0,200])
								.range([150,0]);
					var linePath=d3.line()
									.x(function(d){
										return xScale(d["id"]);
									})
									.y(function(d){
										return yScale(d["aqi"]);
									})
									//.interpolate("basis")//插值模式
									;
					
					var lineoffsetx = 700;
					var lineoffsety = offset15y+40;
					var gline = svga.append("g");
					
					gline.selectAll("path")
						.data(dataset)
						.enter()
						.append("path")
						.attr("transform",`translate(${lineoffsetx},${lineoffsety })`)
						.attr("d",function(d){
							console.log(d);
							return linePath(d["data"]);
						})
						.attr("fill","none")
						.attr("stroke-width",3)
						.attr("stroke",function(d,i){
							return colorScale[cityname];
						})
						.attr("stroke-width", 2)
						.style('stroke-dasharray', function(d, i) {
							return d3.select(this).node().getTotalLength();
						})
						.style('stroke-dashoffset', function(d, i) {
							return d3.select(this).node().getTotalLength();
						})
						.transition()
						.duration(1000)
						.ease(d3.easePolyOut)
						.delay((d, i) => i * 100)
						.style('stroke-dashoffset', 0)
						;
						
					var axisX = d3.axisBottom(xScale);
					var gxaxis = svga.append("g");
					gxaxis
						.attr("transform",`translate(${lineoffsetx},${ lineoffsety+150 })`)
						.call(axisX);
					var axisY = d3.axisLeft(yScale);
					var gyaxis = svga.append("g");
					gyaxis
						.attr("transform",`translate(${lineoffsetx},${ lineoffsety })`)
						.call(axisY);
						
				
			})
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	// left color bar
	for (let i=0;i<=5;++i){
		var g1=svga.append("g")
		    .attr("width", width)
		    .attr("height", height)
		    .attr("id", "g"+i)
			
		let linear = d3.scaleLinear().domain([barlength[i], barlength[i+1]]).range([0, 1]);
		let compute = d3.interpolate(colorchart[i], colorchart[i+1]);
		//console.log(compute)
		ComputeColor.push(compute)
		colorheight = 1.1;
		colorwidth = 20;
		g1.selectAll('rect').data(d3.range(barlength[i], barlength[i+1])).enter()
			.append('rect')
			.attr("id",function(d){
				return "rect"+d;
			})
			.attr('x', 0)
			.attr('y', (d,i) => 570+25 + i * colorheight)
			.attr('width', colorwidth)
			.attr('height', colorheight)
			.style('fill', (d,i) => compute(linear(d)))
			.attr("transform",`translate(${70},${barlength[i]*colorheight})`);
		k=40
		if(i==0)k+=20;
		if(i==1)k+=10;
		g1.append("text")
			.text(barlength[i])
			.attr("font-size","13px")
			.attr("x",k)
			.attr("y",570+(barlength[i])*colorheight+30);
	
	}
	g1.append("text")
		.text(barlength[6])
		.attr("font-size","13px")
		.attr("x",k)
		.attr("y",570+barlength[6]*colorheight+30);
		
	for (let time=2017;time<=2019;time++){
		csvstr = "data/daily/aqi"+time+"_daily.csv"
		d3.csv(csvstr)
			.then(function(d){
				aqi2015 = [];
				days = d.length;
				for (let i=0; i<days; ++i){
					intDay = parseInt(d[i]["date"]);
					yearmonth = Math.floor(intDay/100);
					day = intDay%100;
					//console.log(i)
					aqi2015.push({
						yearmonth:yearmonth,
						day:day,
						beijing:parseInt(d[i]["beijing"]),
						shanghai:parseInt(d[i]["shanghai"]),
						guangzhou:parseInt(d[i]["guangzhou"]),
						shenzhen:parseInt(d[i]["shenzhen"]),
					});
				}
				var flag = new Array();
				var monthaqi = new Array();
				var valid = new Array();
				var monthname = new Array();
				
				var squareWidth = 15;
				var squareHeight = 15;
				var offset15x = 150;
				var offset15y = 30+((time-2014)*squareWidth)*12.3;
				
				
				var g2015=svga.append("g")
					    .attr("width", 600)
					    .attr("height", 600)
						
					g2015.selectAll('rect')
						.data(aqi2015)
						.enter()
						.append('rect')
						.attr("class","aqi")
						.attr("id",function(d){
							
							flag[d["yearmonth"]]=1;
							
							monthaqi[d["yearmonth"]]=0;
							valid[d["yearmonth"]]=0;
	
							
							return "aqi"+d["yearmonth"]+d["day"];
	
						})
						.attr('x', d => squareWidth *d["day"] + offset15x)
						.attr('y', d => squareHeight*(d["yearmonth"]%100) + offset15y)
						.attr('width', squareWidth)
						.attr('height', squareHeight)
						.style('fill', function(d,i){
							if(d[cityname]!=0){
								monthaqi[d["yearmonth"]]+=d[cityname];
								valid[d["yearmonth"]]+=1;
								monthname[d["yearmonth"]]=1;
							}
							if(flag[d["yearmonth"]]==1){
								g2015.append("text")
									.text(d["yearmonth"])
									.attr("font-size","13px")
									.attr("x",d => offset15x-40)
									.attr("y",squareHeight*(d["yearmonth"]%100) + offset15y+12);
								flag[d["yearmonth"]]=0;
							}
							
							var aqi = d[cityname];
							//console.log(i,aqi)
							if(aqi==0){
								return "white";
							}
							let j;
							for (j=0;j<=6;++j){
								if(aqi<=barlength[j+1])
									break;
							}
							//console.log(aqi,j);
							let linear = d3.scaleLinear().domain([barlength[j], barlength[j+1]]).range([0, 1]);
							let compute = d3.interpolate(colorchart[j], colorchart[j+1]);
							let compute2 = ComputeColor[j];
							var color = compute2(linear(aqi));
							return color;
						}).on("mouseover",function(d){
							d3.select(this).style("stroke-width","2");
							d3.select(this).style("stroke","black");
							d3.select(this).style("cursor","pointer");
							d3.select(this.parentNode).raise();
							setTimeout(showTooltip(d), 1000);
							for (let i=0;i<=500;++i){
								if (i!=d[cityname]){
									d3.selectAll("#rect"+i).attr("opacity",0.2)
									
								}
							}
						}).on("mouseout", function(d,i) {
						  d3.select(this.parentNode).lower();
						  d3.select(this).style("stroke-width","0");
						  setTimeout(hideTooltip(), 1000);
						  for (let i=0;i<=500;++i){
						  		d3.selectAll("#rect"+i).attr("opacity",1)
						  }
						})	
				if(time==2017){
					
					for (let i=1;i<=31;++i){
						g2015.append("text")
							.text(i)
							.attr("font-size","11px")
							.attr("x",function() {
								var ans = offset15x+i*squareWidth
								if (i<=9)
									ans+=4
								return ans;
							})
							.attr("y",590);
						flag[d["yearmonth"]]=0;
					}
				}
				
				
				
				
				
				
				
				// form data
				g2015.append("rect")
					.attr("x",1125)
					.attr("y",45+190*(time-2014)+offset[cityname])
					.attr("width",20)
					.attr("height",2)
					.attr("fill",colorScale[cityname]);
				g2015.append("text")
					.attr("x",1150)
					.attr("y",50+190*(time-2014)+offset[cityname])
					.text(cityname)
				dataset = [];
				dataset.push(new Array());
				dataset[0]["data"]=[];
				var n = 0;
				for (var key in monthname){
					n=n+1;
					var mystr = key;
					var res = 0;
					if (valid[mystr]!=0)
						res = Math.floor(monthaqi[mystr]/valid[mystr]);
				
					dataset[0]["data"].push({
						id:n,
						aqi:res,
					})
				}
				
				var xScale=d3.scaleLinear()
							.domain([1,12])
							.range([0,400]);
				//console.log(d3.min(dataset))
				var yScale=d3.scaleLinear()
							.domain([0,200])
							.range([150,0]);
				var linePath=d3.line()
								.x(function(d){
									return xScale(d["id"]);
								})
								.y(function(d){
									return yScale(d["aqi"]);
								})
								//.interpolate("basis")//插值模式
								;
				
				var lineoffsetx = 700;
				var lineoffsety = offset15y+40;
				var gline = svga.append("g");
				
				gline.selectAll("path")
					.data(dataset)
					.enter()
					.append("path")
					.attr("transform",`translate(${lineoffsetx},${lineoffsety })`)
					.attr("d",function(d){
						return linePath(d["data"]);
					})
					.attr("fill","none")
					.attr("stroke-width",3)
					.attr("stroke",function(d,i){
						return colorScale[cityname];
					})
					.attr("stroke-width", 2)
					.style('stroke-dasharray', function(d, i) {
						return d3.select(this).node().getTotalLength();
					})
					.style('stroke-dashoffset', function(d, i) {
						return d3.select(this).node().getTotalLength();
					})
					.transition()
					.duration(1000)
					.ease(d3.easePolyOut)
					.delay((d, i) => i * 100)
					.style('stroke-dashoffset', 0)
					;
					
				var axisX = d3.axisBottom(xScale);
				var gxaxis = svga.append("g");
				gxaxis
					.attr("transform",`translate(${lineoffsetx},${ lineoffsety+150 })`)
					.call(axisX);
				var axisY = d3.axisLeft(yScale);
				var gyaxis = svga.append("g");
				gyaxis
					.attr("transform",`translate(${lineoffsetx},${ lineoffsety })`)
					.call(axisY);
				
				
				
			})
	}
	
	/*
	for (let time=2017;time<=2019;time++){
		csvstr = "data/daily/aqi"+time+"_daily.csv"
		d3.csv(csvstr)
			.then(function(d){
				aqi2015 = [];
				days = d.length;
				for (let i=0; i<days; ++i){
					intDay = parseInt(d[i]["date"]);
					yearmonth = Math.floor(intDay/100);
					day = intDay%100;
					//console.log(i)
					aqi2015.push({
						yearmonth:yearmonth,
						day:day,
						beijing:parseInt(d[i]["beijing"]),
						sh:parseInt(d[i]["shanghai"]),
						gz:parseInt(d[i]["guangzhou"]),
						sz:parseInt(d[i]["shenzhen"]),
					});
				}
				var flag = new Array();
				var squareWidth = 15;
				var squareHeight = 15;
				var offset15x = 750;
				var offset15y = 10+((time-2017)*squareWidth)*12.3;
				var g2015=svga.append("g")
					    .attr("width", 600)
					    .attr("height", 600)
					g2015.selectAll('rect')
						.data(aqi2015)
						.enter()
						.append('rect')
						.attr("id",function(d){
							flag[d["yearmonth"]]=1;
							return "aqi"+d["yearmonth"]+d["day"];
	
						})
						.attr('x', d => squareWidth *d["day"] + offset15x)
						.attr('y', d => squareHeight*(d["yearmonth"]%100) + offset15y)
						.attr('width', squareWidth)
						.attr('height', squareHeight)
						.style('fill', function(d,i){
							if(flag[d["yearmonth"]]==1){
								g2015.append("text")
									.text(d["yearmonth"])
									.attr("font-size","13px")
									.attr("x",d => offset15x-40)
									.attr("y",squareHeight*(d["yearmonth"]%100) + offset15y+12);
								flag[d["yearmonth"]]=0;
							}
							
							var aqi = d["beijing"];
							//console.log(i,aqi)
							if(aqi==0){
								return "white";
							}
							let j;
							for (j=0;j<=6;++j){
								if(aqi<=barlength[j+1])
									break;
							}
							//console.log(aqi,j);
							let linear = d3.scaleLinear().domain([barlength[j], barlength[j+1]]).range([0, 1]);
							let compute = d3.interpolate(colorchart[j], colorchart[j+1]);
							let compute2 = ComputeColor[j];
							var color = compute2(linear(aqi));
							return color;
						}).on("mouseover",function(d){
							d3.select(this).style("stroke-width","2");
							d3.select(this).style("stroke","black");
							d3.select(this).style("cursor","pointer");
							d3.select(this.parentNode).raise();
							setTimeout(showTooltip(d), 1000);
						}).on("mouseout", function(d,i) {
						  d3.select(this.parentNode).lower();
						  d3.select(this).style("stroke-width","0");
						  setTimeout(hideTooltip(), 1000);
						})	
						
				if(time==2018){
					for (let i=1;i<=31;++i){
						g2015.append("text")
							.text(i)
							.attr("font-size","11px")
							.attr("x",function() {
								var ans = offset15x+i*squareWidth
								if (i<=9)
									ans+=4
								return ans;
							})
							.attr("y",20);
						flag[d["yearmonth"]]=0;
					}
				}
				
			})
	}
	*/
	//$("svg").remove();
}