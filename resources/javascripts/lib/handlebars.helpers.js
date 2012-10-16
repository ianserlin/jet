// Handlebars helpers
function capitalize(str){
	return str ? str[0].toUpperCase() + str.substr(1) : '';
}
Handlebars.registerHelper('capitalize', function(value, options){
	return capitalize(value);
});
Handlebars.registerHelper('currency', function(value, options){
	return accounting.formatMoney(value);
});
Handlebars.registerHelper('images', function(images, options){
	var imagesHTML = '';
	if(images){
		for(var i = 0; i < images.length; i++){
			imagesHTML += '<li><img src="'+images[i].preview_url+'"/></li>';
		}
	}
	return new Handlebars.SafeString(imagesHTML);
});
Handlebars.registerHelper('image', function(images, options){
	var imagesHTML = ''
		, cssClass = options.hash.class ? options.hash.class : 'img-rounded';

	if(images && images.length && images.length > 0){
		imagesHTML += '<img class="'+cssClass+'" src="'+images[0].preview_url+'"/>';
	}
	return new Handlebars.SafeString(imagesHTML);
});
Handlebars.registerHelper('openHours', function(hours, options){
	var hoursHTML 	= ''
		, hours 	= hours[0];
	if(hours){
		hoursHTML = [];
		if(hours.monday){
			hoursHTML.push('M');
		}
		if(hours.tuesday){
			hoursHTML.push('T');
		}
		if(hours.wednesday){
			hoursHTML.push('W');
		}
		if(hours.thursday){
			hoursHTML.push('Th');
		}
		if(hours.friday){
			hoursHTML.push('F');
		}
		if(hours.saturday){
			hoursHTML.push('Sa');
		}
		if(hours.sunday){
			hoursHTML.push('Su');
		}
		hoursHTML = hoursHTML.join(', ');
		hoursHTML += ' ' + moment(hours.open_time).format('h:mm a') + '-' + moment(hours.close_time).format('h:mm a');
	}
	return new Handlebars.SafeString(hoursHTML);
});
Handlebars.registerHelper('website', function(sites, options){
	var sitesHTML = '';
	if(sites){
		for(var i = 0; i < sites.length; i++){
			sitesHTML += '<a target="_blank" href="' + sites[i].url + '">'+sites[i].url+'</a>';
		}
	}
	return new Handlebars.SafeString(sitesHTML);
});

Handlebars.registerHelper('email', function(email, options){
	var emailHTML = '';
	emailHTML += '<a target="_blank" href="mailto:' + email + '">'+email+'</a>';
	return new Handlebars.SafeString(emailHTML);
});

Handlebars.registerHelper('latlng', function(address, options){
	var latlngHTML = '';
	latlngHTML += address.coordinates[0] + ',' + address.coordinates[1];
	return new Handlebars.SafeString(latlngHTML);
});

// TODO: get this all into the Ember Handlebars
Handlebars.registerHelper('address', function(property, options){

});