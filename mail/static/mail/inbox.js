document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('form').onsubmit = () => {
    let recipients = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;

    let email = new Object();
    email.recipients = recipients;
    email.subject = subject;
    email.body = body;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify(email)
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });

    load_mailbox('sent');

    return false;
  };

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  const div = document.createElement('div');
  const emailView = document.querySelector('#emails-view');
  div.setAttribute('class','list-group');

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  // Show the mailbox name
  emailView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  emailView.append(div);

  if( mailbox === 'inbox' ){
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(email => {
      email.forEach(element => {
        
        const a = document.createElement('a');
        const labelSender = document.createElement('label');
        const labelSubject = document.createElement('label');
        const labelTimestamp = document.createElement('label');
        a.setAttribute('class','list-group-item list-group-item-action inbx-clck');
        a.setAttribute('data-id', element.id);
        labelSender.setAttribute('class','col-lg-4');
        labelSubject.setAttribute('class','col-lg-4');
        labelTimestamp.setAttribute('class','col-lg-4 text-right');

        labelSender.innerHTML = element.sender;
        labelSubject.innerHTML = element.subject;
        labelTimestamp.innerHTML = element.timestamp;
        a.append(labelSender);
        a.append(labelSubject);
        a.append(labelTimestamp);
        div.append(a);
      });

      console.log(email);

      document.querySelectorAll('.inbx-clck').forEach( function(a){
        a.onclick = function(){
          
          const id = a.dataset.id;
          document.querySelector('#emails-view').innerHTML = ""

          fetch(`/emails/${id}`)
          .then(response => response.json())
          .then(emailContents => {

            let recipients = '';
            let i = 1;
            emailContents.recipients.forEach( value => {
              recipients += value ; 
              if(emailContents.recipients.length > i){
                recipients += ', ';
              }
              i++;
            });

            const labelMailContentSender = document.createElement('label');
            const labelMailContentRecipients = document.createElement('label');
            const labelMailContentSubject = document.createElement('label');
            const labelMailContentTimestamp = document.createElement('label');
            const labelMailContentButtonReply = document.createElement('button');
            const labelMailContentButtonArchived = document.createElement('button');
            const labelMailContentDivCard = document.createElement('div');
            const labelMailContentDivCardBody = document.createElement('div');

            labelMailContentSender.setAttribute('class','col-lg-12 pl-0');
            labelMailContentRecipients.setAttribute('class','col-lg-12 pl-0');
            labelMailContentSubject.setAttribute('class','col-lg-12 pl-0');
            labelMailContentTimestamp.setAttribute('class','col-lg-12 pl-0');
            labelMailContentButtonReply.setAttribute('class','btn btn-outline-primary cstm-mrgn');
            labelMailContentButtonArchived.setAttribute('class','btn btn-outline-primary cstm-mrgn');
            labelMailContentDivCard.setAttribute('class','card');
            labelMailContentDivCardBody.setAttribute('class','card-body');

            labelMailContentSender.innerHTML = '<label style="font-weight : bold">From :&nbsp;</label>' + emailContents.sender;
            labelMailContentRecipients.innerHTML = '<label style="font-weight : bold">To :&nbsp;</label>' + recipients;
            labelMailContentSubject.innerHTML = '<label style="font-weight : bold">Subject :&nbsp;</label>' + emailContents.subject;
            labelMailContentTimestamp.innerHTML = '<label style="font-weight : bold">Timestamp :&nbsp;</label>' + emailContents.timestamp;
            labelMailContentButtonReply.innerHTML = 'Reply';
            labelMailContentButtonArchived.innerHTML = 'Archive';
            labelMailContentDivCardBody.innerHTML = emailContents.body;

            labelMailContentDivCard.append(labelMailContentDivCardBody);
            emailView.append(labelMailContentButtonReply);
            emailView.append(labelMailContentButtonArchived);
            emailView.append(labelMailContentSender);
            emailView.append(labelMailContentRecipients);
            emailView.append(labelMailContentSubject);
            emailView.append(labelMailContentTimestamp);
            emailView.append(labelMailContentDivCard);

            console.log(emailContents);
          });
        }
      });
      
    })
  }

  
}