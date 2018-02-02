const functions = require('firebase-functions');

const nodemailer = require('nodemailer');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
const SENDGRID_API_KEY = functions.config().sendgrid.key;
const sgmail = require('@sendgrid/mail');
sgmail.setApiKey(SENDGRID_API_KEY);
admin.initializeApp(functions.config().firebase);


// Listens for new messages added to messages/:pushId
exports.newOfferAdded = functions.database.ref('/Offers/{offerId}').onWrite( event => {

    console.log('Push notification event triggered');

    //  Grab the current value of what was written to the Realtime Database.
    var valueObject = event.data.val();

   
  // Create a notification
    const payload = {
        notification: {
            title:"New Offer Added",
            body: valueObject.offerName,
            type:"offer"
        },
    };

  //Create an options object that contains the time to live for the notification and the priority
    const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };

    
    return admin.messaging().sendToTopic("offers", payload, options);
});

exports.adminnft = functions.database.ref('/Orders/{orderId}').onWrite( event => {

    console.log('Push notification event triggered to admin');

    //  Grab the current value of what was written to the Realtime Database.
    var valueObject = event.data.val();

   
  // Create a notification
    const payload = {
        notification: {
            title:"New Order",
            body: "New order "+valueObject.orderId+" recieved from "+valueObject.userName+" for "+valueObject.serviceTime,
            type:"order"
        },
    };

  //Create an options object that contains the time to live for the notification and the priority
    const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };

    
    return admin.messaging().sendToTopic("adminnft", payload, options);
});
exports.adminnftforcancel = functions.database.ref('/Orders/{status}').onUpdate( event => {

    console.log('Push notification event triggered to admin');

    //  Grab the current value of what was written to the Realtime Database.
    var valueObject = event.data.val();
    if(valueObject.status ==4)
    {
        const payload = {
            notification: {
                title:"Order "+valueObject.orderId,
                body: "Order has been Cancelled by "+valueObject.userName,
                type:"order"
            },
        };
    
      //Create an options object that contains the time to live for the notification and the priority
        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };
    
        
        return admin.messaging().sendToTopic("adminnft", payload, options);
    }

   
  // Create a notification
    
});



exports.orderplaced = functions.database.ref('/Orders/{orderId}').onWrite(event =>{


    var valueObject = event.data.val();
    console.log('Push notification event triggered for '+valueObject.orderId+' customer: '+valueObject.userName);
    var productList ="";
    for(var i=0 ; i<valueObject.products.length ; i++)
    {
        productList = productList + '<br>'+ '<b>'+ valueObject.products[i].name;
    }
    const msg ={
            to: 'srisbeauty2989@gmail.com',
            from:'<no-reply>@apporders.srisbeauty.in',
            subject: '[Sri\'s Beauty App] New customer order '+valueObject.orderId,
            templateId: '9f9dacf6-c843-45cd-bd87-ebc3113ee8ce',
            substitutionWrappers: ['{{','}}'],
            substitutions: {
                    name: valueObject.userName,
                    orderid: valueObject.orderId,
                    productl: productList,
                    cartprice: valueObject.total,
                    useraddress: valueObject.address,
                    usercontact: valueObject.userPhoneNumber,
                    servicetime: valueObject.serviceTime,
                    email: valueObject.email


            }
    };
    return sgmail.send(msg).then(()=>{
        console.log('email sent via send grid');
    }).catch(err=> console.log('some error while sending mail via sendgrid'));


  /*  var listOfusers = admin.database().ref('/Users').once('value');
    console.log(typeof listOfusers);
    console.log(typeof listOfusers[0]);
    console.log(typeof listOfusers.key+'---' + listOfusers.userName);
    console.log(typeof listOfusers[0].key+'---' + listOfusers[0].userName );*/
    var tokensList =[];
  /*  listOfusers.forEach(userItem =>{
            if(userItem.adminstrator)
            {
                tokensList.push(userItem.key);
            }
    });*/
   /* const getSomethingPromise = admin.database().ref(`/Users/`).once('value');

     return getSomethingPromise.then(results => {
        const somethingSnapshot = results[0];
        console.log(typeof somethingSnapshot)

        // Do something with the snapshot
    });*/
    /*var valueObject = event.data.val();


    return Promise.all([getDeviceTokensPromise]).then(results => {
      const tokensSnapshot = results[0];

      if (!tokensSnapshot.hasChildren()) {
        return console.log('There are no notification tokens to send to.');
      }
      else{
        console.log('found admin.');
      }
      console.log('There are', tokensSnapshot.numChildren(), 'tokens to send notifications to.');
      */
  
      // Notification details.
      const payload = {
        notification: {
          title: 'You have a new order!',
          body: `${valueObject.userName} has requested a service.`,
          
        }
      };
     // return admin.messaging().sendToDevice(tokensList, payload)
  
      // Listing all tokens.
   /*   const tokens = Object.keys(tokensSnapshot.val());
  
      // Send notifications to all tokens.
      return admin.messaging().sendToDevice(tokens, payload).then(response => {
        // For each message check if there was an error.
        const tokensToRemove = [];
        response.results.forEach((result, index) => {
          const error = result.error;
          if (error) {
            console.error('Failure sending notification to', tokens[index], error);
            // Cleanup the tokens who are not registered anymore.
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
              tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
            }
          }
        });
        return Promise.all(tokensToRemove);
      });
    });*/


});

exports.mailnotification = functions.database.ref('/Orders/{status}').onUpdate(event =>{

    //Mail notification for order status change
    var valueObject = event.data.val();
    console.log('Push notification event triggered for '+valueObject.orderId+' customer: '+valueObject.userName);
    var productList ="";
    var status ="";
    for(var i=0 ; i<valueObject.products.length ; i++)
    {
        productList = productList + '<br>'+ '<b>'+ valueObject.products[i].name;
    }
    if(valueObject.status ==1)
    {
        status ="Confirmed";
    }
    if(valueObject.status ==0)
    {
        status ="Placed";
    }
    else if (valueObject.status ==2)
    {
        status="Rejected";
    }
    else if (valueObject.status ==4)
    {
        status="Cancelled";
    }
    var to = valueObject.email;
    if(status == "Cancelled")
    {
            var to = "["+valueObject.email+",srisbeauty2989@gmail.com]"
    }
   
    
        const msg ={
            to: to,
            from:'<no-reply>@apporders.srisbeauty.in',
            subject: '[Sri\'s Beauty App] Order '+valueObject.orderId+' '+status,
            templateId: 'aaf2e938-0c10-4a4a-9213-a7f1b9b0c0e1',
            substitutionWrappers: ['{{','}}'],
            substitutions: {
                    name: valueObject.userName,
                    orderid: valueObject.orderId,
                    productl: productList,
                    cartprice: valueObject.total,
                    useraddress: valueObject.address,
                    usercontact: valueObject.userPhoneNumber,
                    servicetime: valueObject.serviceTime,
                    email: valueObject.email,
                    status: status


            }
   
    
    };
    return sgmail.send(msg).then(()=>{
        console.log('email sent via send grid for order status change');
    }).catch(err=> console.log('some error while sending mail via sendgrid'));

    /*const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
               user: 'ishan.das387@gmail.com',
               pass: 'STARS123456789'
           }
       });
    
    
        const snapshot = event.data;
        const val = snapshot.val();
      
        if (!snapshot.changed('subscribedToMailingList')) {
          return null;
        }
      
        const mailOptions = {
          from: 'ishan.das387@gmail.com',
          to: val.email
        };
        
       
        // Building Email message.
        mailOptions.subject =  'Thanks and Welcome!' +'Sad to see you go :`(';
        mailOptions.text =  'Thanks you for subscribing to our newsletter. You will receive our next weekly newsletter.' + 'I hereby confirm that I will stop sending you the newsletter.';
        
        return transporter.sendMail(mailOptions)
          .then(() => console.log(`subscription confirmation email sent to:`, val.email))
          .catch(error => console.error('There was an error while sending the email:', error));*/
          


      
});

exports.orerstatuschange = functions.database.ref('/Orders/{status}').onUpdate(event =>{
    var valueObject = event.data.val();    
    var status ="";
    console.log('Push notification event triggered for '+valueObject.orderId+' customer: '+valueObject.userName);

   
    if(valueObject.status ==1)
    {
        status ="Confirmed";
    }
    else if (valueObject.status ==2)
    {
        status="Rejected";
    }
    else if (valueObject.status ==4)
    {
        status="Cancelled";
    }
    const payload = {
        notification: {
            title:"Order staus change",
            body: "Your order "+valueObject.orderId+ " is "+status,
            type:"order"
        },
    };

    return admin.messaging().sendToDevice(valueObject.userToken, payload);

   /* console.log('setting up email');
   

       const mailOptions = {
        from: '"Spammy Corp." <noreply@firebase.com>',// sender address
        to: valueObject.email, // list of receivers
        subject: 'Your order '+valueObject.orderId+ ' is '+status, // Subject line
        html: '<p>Hi</p>'+ valueObject.userName+',<p>Your order has been<p>'+status// plain text body
       
      };
      // send mail with defined transport object
      console.log('trying to send mail to');
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });*/
});
