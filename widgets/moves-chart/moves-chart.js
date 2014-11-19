define(["core/DashboardWidget"], function(DashboardWidget) {

    var MovesStats = new DashboardWidget();
    var Chartjs;

    MovesStats.init = function() {
        // load Chartjs (http://www.chartjs.org/)
        require([this.manifest.WidgetRepositoryURL + "/" + this.manifest.WidgetName + "/Chart.min.js"], function(Chart){
            MovesStats.Chartjs = Chart.noConflict();
        });
        
        MovesStats.reload();
    };
    
    MovesStats.reload = function() {
        $.ajax({url:this.manifest.WidgetRepositoryURL + "/" + this.manifest.WidgetName + "/moves.mustache",
            success: function(template) {
                MovesStats.postLoad(template);
            }
        });
    }

    MovesStats.postLoad = function(template) {
        var html = Hogan.compile(template);
        $("#moves-chart-widget .flx-body").empty().append(html.render({}));
        var movesFacets = this.digest.facets["moves-move"];
        var runningMinutes = 0, walkingMinutes = 0,
            transportMinutes = 0, cyclingMinutes = 0;
        if (movesFacets!=null) {
            for (var i=0; i<movesFacets.length; i++) {
                if (movesFacets[i]["hasActivities"]) {
                    var activities = movesFacets[i]["activities"];
                    for (var j=0; j<activities.length; j++) {
                        var duration = activities[j]["duration"];
                        switch (activities[j]["activityGroup"]) {
                            case "walking":
                                walkingMinutes += duration["totalSeconds"]/60;
                                break;
                            case "cycling":
                                cyclingMinutes += duration["totalSeconds"]/60;
                                break;
                            case "transport":
                                transportMinutes += duration["totalSeconds"]/60;
                                break;
                            case "running":
                                runningMinutes += duration["totalSeconds"]/60;
                                break;
                        }
                    }
                }
            }
        }
        var ctx = document.getElementById("activityChart").getContext("2d");
        var data = [
            {
                value: Math.round(walkingMinutes*100)/100,
                color:"green",
                highlight: "black",
                label: "Walking"
            },
            {
                value: Math.round(cyclingMinutes*100)/100,
                color: "cyan",
                highlight: "black",
                label: "Cycling"
            },
            {
                value: Math.round(transportMinutes*100)/100,
                color: "gray",
                highlight: "black",
                label: "Transport"
            },
            {
                value: Math.round(runningMinutes*100)/100,
                color: "magenta",
                highlight: "black",
                label: "Running"
            }
        ]
        if (!_.isUndefined(this.Chartjs)) {
            new this.Chartjs(ctx).Pie(data,{});
        }
    }

    return MovesStats;
})