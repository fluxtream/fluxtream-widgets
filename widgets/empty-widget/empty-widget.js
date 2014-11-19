define(["core/DashboardWidget"], function(DashboardWidget) {

    var EmptyWidget = new DashboardWidget();

    EmptyWidget.init = function() {
        // loading our mustache template using the Widget's repository URL
        // note that using requirejs to do this is theoretically possible as well, it's just
        // more straightforward to do it using jQuery
        $.ajax({url:this.manifest.WidgetRepositoryURL + "/" + this.manifest.WidgetName + "/empty.mustache",
            success: function(template) {
                EmptyWidget.postLoad(template);
            }
        });
    };

    // This is called after we have loaded all templates and dependencies and the widget has been
    // properly initialized and has access to the digest, manifest and potentially settings
    EmptyWidget.postLoad = function(template) {
        // hogan is one of the pre-loaded libraries and we use it to compile our mustache template
        var html = Hogan.compile(template);
        $("#empty-widget-widget .flx-body").empty();
        $("#empty-widget-widget .flx-body").append(
            html.render()
        );
    }

    return EmptyWidget;
})