$(document).on("page:load ready", function() {
  // Pusher
  var pusher = new Pusher('200b6370c503d11d4fa4', {
    encrypted: true
  });

  $.ajax({
    dataType: "text",
    url: "/notifications/signed_in",
    type: "GET",
    success: function (json) {
      var result = JSON.parse(json).signed_in;

      if (result != -1) {
        // Show notifications on initial sign in
        if ($('body').hasClass('pages home')) {
          fetchNotifications();
        }

        var channel = pusher.subscribe('private-' + result);
        channel.bind('new_notification', function(data) {
          renderNotifications(data.notifications);
        });
      }
    }
  });

  var click_flag = 0;

  $('.notifications_button').css({"opacity": 1});
  $('.notifications_button').click(function() {
    event.preventDefault();
    if (click_flag % 2 == 0) {
      $('#notifications').css({"display": "block"});
      $('.notifications_button').css({"opacity": 0.5});

      // Fetch notifications for current_user
      fetchNotifications();
    } else {
      $('#notifications').css({"display": "none"});
      $('.notifications_button').css({"opacity": 1});
    }
    click_flag++;
  });

  $('#close_notifications').click(function() {
    event.preventDefault();
    $('#notifications').css({"display": "none"});
    $('.notifications_button').css({"opacity": 1});
    click_flag++;
  });

   $('#clear_notifcations').click(function() {
    $('#notifications_list').empty();
    $('#notifications_none').css({"display": "block"});

    $.ajax("/notifications/clear");
  });
});

function renderNotifications(notifications) {
  $('#notifications_list').empty();
  $('#notifications').css({ "display": "block" });
  $('#notifications_none').css({"display": "none"});

  _.each(notifications, function(notification) {
    var uniqueid = notification.uniqueid;
    var data = JSON.parse(notification.data);
 
    if (data.type == 'comment_on_trigger' || data.type == 'comment_on_strategy') {
      var type_name;
      if (data.type == 'comment_on_trigger') {
        type_name = data.trigger;
      } else if (data.type == 'comment_on_strategy') {
        type_name = data.strategy;
      }

      if (data.cutoff) {
        var notification = data.user + ' commented "' + data.comment + '" [...] on ' + type_name;
      } else {
        var notification = data.user + ' commented "' + data.comment + '" on ' + type_name;
      }

      var link;
      if (data.type == 'comment_on_trigger') {
        link = 'triggers/' + data.triggerid;
      } else if (data.type == 'comment_on_strategy') {
        link = 'strategies/' + data.strategyid;
      }

      var notification_link = '<a class="notification_link" id="' + uniqueid + '" href="' + link + '">' + notification + '</a>';

      $('#notifications_list').prepend(notification_link);
    } else if (data.type == 'accepted_ally_request' || data.type == 'new_ally_request') {
      var link = 'profile?userid=' + data.userid;
      var notification_link;

      if (data.type == 'accepted_ally_request') {
        var notification = data.user + ' accepted your ally request!';
        notification_link = '<a class="notification_link" id="' + uniqueid + '" href="' + link + '">' + notification + '</a>'
      } else if (data.type == 'new_ally_request') {
        var add = '/allies/add?ally_id=' + data.userid + '&refresh=' + window.location.pathname;
        var remove = '/allies/remove?ally_id=' + data.userid + '&refresh=' + window.location.pathname;

        var accept = '<a rel="nofollow" data-method="post" class="notification_link small_margin_left display_inline" href="' + add + '"><i class="fa fa-check"></i></a>';
        var reject = '<a data-confirm="Are you sure?" rel="nofollow" data-method="post" class="notification_link small_margin_left display_inline" href="' + remove + '"><i class="fa fa-times"></i></a>';

        notification_link = '<div id="' + uniqueid + '" class ="small_margin_top"><a class="notification_link display_inline" href="' + link + '">' + data.user + '</a> sent an ally request!' + accept + reject + '</span>';
      }
   
      $('#notifications_list').prepend(notification_link);
    } else if (data.type == 'new_group' || data.type == 'new_group_member') {
      // Alice created a new group "Name"
      var notification;

      if (data.type == 'new_group')
        notification = data.user + ' created a group "' + data.group + '"';
      else if (data.type == 'new_group_member') {
        notification = data.user + ' joined your group "' + data.group + '"';
      }

      var link = 'groups/' + data.groupid;
    
      var notification_link = '<a class="notification_link" id="' + uniqueid + '" href="' + link + '">' + notification + '</a>';

      $('#notifications_list').prepend(notification_link);
    }
  })
}

function fetchNotifications(){
  $.ajax({
    dataType: "text",
    url: "/notifications/fetch_notifications",
    type: "GET",
    success: function (json) {
      var data = JSON.parse(json).fetch_notifications;
      if (data.length > 0) {
        renderNotifications(data);
      } else {
        $('#notifications_none').css({"display": "block"});
      }
    }
  });
}
