Timeline = function(elementId, startDate) {
	this.element = jQuery(elementId);
	this.element.addClass("timeline");
	this.element[0].timeline = this;
  	this.startDate = startDate;
	// TODO: end date is today plus one month
  	this.endDate = new Date();
	this.endDate.setMonth(this.endDate.getMonth() + 1);
  	this.timelineWidth = this.endDate.getTime() - this.startDate.getTime();
	this.createBackground();
}
Timeline.getTimeline = function(element) {
	return jQuery(element).parents().filter(".timeline")[0].timeline;
}

Timeline.prototype = {
	getPosition: function(date) {
		return 100 * (date.getTime() - this.startDate.getTime()) / this.timelineWidth;
	},
	hideEvent: function(wrapper) {
		wrapper.find(".event_content").hide(500);
		wrapper.find(".event_tick").animate( { height:"15px" }, 500 );
		wrapper.find(".mouse_catcher").css({"z-index" : "1", "height" : "15px"});
	},
  	showEvent: function(wrapper) {
		wrapper.find(".event_tick").animate( { height:"24px" }, 500 );
		wrapper.find(".event_content").show(500);
		wrapper.find(".mouse_catcher").css({"z-index" : "2", "height" : "24px"});
	},
	getWrapper: function(element) {
		return jQuery(element).parents().filter(".event_wrapper");
	},
	createBackground: function() {
		currentTime = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 1, 1);
		while (currentTime < this.endDate) {
			jQuery("<div>")
				.addClass(currentTime.getMonth() == 0 ? "year" : "month")
				.css({"left" : this.getPosition(currentTime) + "%"})
				.appendTo("#timeline");
			currentTime.setMonth(currentTime.getMonth() + 1);
		}
	},
	createWrapper: function(element, date) {
      	wrapper = jQuery("<div/>")
        	.attr("class", "event_wrapper")
        	.css({"left" : this.getPosition(date) + "%"});

		jQuery("<div/>").attr("class", "event_tick").appendTo(wrapper);

		content = jQuery("<div/>").attr("class", "event_content").appendTo(wrapper);
		element.appendTo(content);

		jQuery("<div>").attr("class", "mouse_catcher")
			.bind("mouseenter", function(e) {
					timeline = Timeline.getTimeline(this);
					wrapper = timeline.getWrapper(this);
					timeline.showEvent(wrapper);
		    	})
			.appendTo(wrapper);
		
		wrapper
			.children().andSelf()
			.bind("mouseleave", function(event) {
				timeline = Timeline.getTimeline(this);
				wrapperOfThisElement = timeline.getWrapper(this);
				wrapperOfNewElement = timeline.getWrapper(event.relatedTarget);
				if (wrapperOfThisElement[0] != wrapperOfNewElement[0]) {
					timeline.hideEvent(wrapperOfThisElement);
				}
			});

        wrapper.appendTo(this.element);
	},
	loadFromRSSFeed: function(url) {
		jQuery.get(url, function(data, textStatus) {
			jQuery(data).find("item").each(function() {
				event = jQuery("<a>")
					.attr("href", jQuery(this).find("link").text())
					.html(jQuery(this).find("title").text());
				timeline.createWrapper(event, (new Date(jQuery(this).find("pubDate").text())));
			});
		});
	},
	loadFromJson: function(json) {
		for (var i in json) {
			var element = json[i];
			var event = jQuery("<a>")
				.attr("href", element.url)
				.html(element.title);

			this.createWrapper(event, new Date(element.date));
		}
	}
}
