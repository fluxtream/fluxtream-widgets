define(["core/DashboardWidget"], function(DashboardWidget) {

    var EmptyWidget = new DashboardWidget();

    EmptyWidget.init = function() {
        $.ajax({url:this.manifest.WidgetRepositoryURL + "/" + this.manifest.WidgetName + "/empty.mustache",
            success: function(template) {
                EmptyWidget.postLoad(template);
            }
        });
    };

    EmptyWidget.postLoad = function(template) {
        var html = Hogan.compile(template);
        $("#empty-widget-widget .flx-body").empty();
        $("#empty-widget-widget .flx-body").append(
            html.render({"manifest" : this.manifest})
        );
    }

    return EmptyWidget;
})