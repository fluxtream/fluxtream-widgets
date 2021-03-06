define(["core/DashboardWidget"], function(DashboardWidget) {

    var MovesStats = new DashboardWidget();

    MovesStats.init = function() {
        MovesStats.reload();
    };
    
    MovesStats.reload = function() {
        $.ajax({url:this.manifest.WidgetRepositoryURL + "/" + this.manifest.WidgetName + "/moves.mustache",
            success: function(template) {
                MovesStats.postLoad(template);
            }
        });
    }
    
    // this gives us a chance to issue an error warning. If everything's OK, just save the settings and reload the view.
    MovesStats.validateSettings = function(onDone) {
        var aggregateValues = $("input:radio[name=aggregateValues]:checked").val();
        this.saveSettings({"aggregateValues" : aggregateValues});
        MovesStats.reload();
        onDone();
    };

    // inject the widget's settings into our form
    MovesStats.bindWidgetSettings = function(widgetSettings,onDone) {
        $("input:radio[name=aggregateValues][value=" + widgetSettings.aggregateValues + "]").attr("checked","checked");
        onDone();
    }

    // initialize settings on first run
    MovesStats.defaultSettings = function(widgetSettings,onDone) {
        if (typeof(widgetSettings.aggregateValues)=="undefined")
            $("input:radio[name=aggregateValues][value=no]").attr("checked","checked");
        onDone();
    }

    MovesStats.postLoad = function(template) {
        var html = Hogan.compile(template);
        var movesFacets = this.digest.facets["moves-move"];
        var runningMinutes = 0, walkingMinutes = 0,
            transportMinutes = 0, cyclingMinutes = 0;
        // let's run through all moves activities and extract the durations for the different
        // types of activities
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
        // average out duration if looking at weekly or monthly data
        if (this.settings.aggregateValues==="no") {
            switch(this.digest.calendar.timeUnit) {
                case "WEEK":
                    walkingMinutes/=7;
                    cyclingMinutes/=7;
                    transportMinutes/=7;
                    runningMinutes/=7;
                    break;
                case "MONTH":
                    var year = Number(this.digest.calendar.state.substring(6, 10));
                    var month = Number(this.digest.calendar.state.substring(11));
                    var daysInMonth = new Date(year, month, 0).getDate();
                    walkingMinutes/=daysInMonth;
                    cyclingMinutes/=daysInMonth;
                    transportMinutes/=daysInMonth;
                    runningMinutes/=daysInMonth;
                    break;
            }
        }
        var activityDurations = {
            walking : walkingMinutes>0 ? moment.duration(walkingMinutes, "minutes").humanize() : "-",
            cycling : cyclingMinutes>0 ? moment.duration(cyclingMinutes, "minutes").humanize() : "-",
            transport : transportMinutes>0 ? moment.duration(transportMinutes, "minutes").humanize() : "-",
            running : runningMinutes>0 ? moment.duration(runningMinutes, "minutes").humanize() : "-"
        };
        $("#moves-stats-widget .flx-body").empty().append(
            html.render({manifest : this.manifest,
                         activityDurations : activityDurations,
                         digest : this.digest
                        })
        );
    }

    return MovesStats;
})