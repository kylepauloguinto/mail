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
  div.setAttribute('class','list-group');

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  document.querySelector('#emails-view').append(div);

  if( mailbox === 'inbox' ){
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(email => {
      email.forEach(element => {
        
        const a = document.createElement('a');
        const label1 = document.createElement('label');
        const label2 = document.createElement('label');
        const label3 = document.createElement('label');
        a.setAttribute('class','list-group-item list-group-item-action');
        label1.setAttribute('class','col-lg-4');
        label2.setAttribute('class','col-lg-4');
        label3.setAttribute('class','col-lg-4 text-right');

        label1.innerHTML = element.sender;
        label2.innerHTML = element.subject;
        label3.innerHTML = element.timestamp;
        a.append(label1);
        a.append(label2);
        a.append(label3);
        div.append(a);
      });
      console.log(email);
    })
  }

}