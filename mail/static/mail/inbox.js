document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.endsWith("/register")) {
    $("#autoModal").modal("show");
  }
  // japanese codes
  $(".jap").hide();
  $("#lang").on("click", function () {
    var $button = $(this);
    let isPressed = $(this).attr("aria-pressed") === "true";
    if (isPressed) {
      $button.text("日本語版");
      $("#all").show();
      $(".jap").hide();
      $(".eng").show();
    } else {
      $button.text("English Version");
      $("#all-jap").show();
      $(".jap").show();
      $(".eng").hide();
    }
  });

  const form = document.getElementById("login-form");
  const loader = document.getElementById("loader");
  const button = form.querySelector("button");

  form.addEventListener("submit", () => {
    // show loader
    loader.style.display = "flex";
    button.disabled = true;
  });



  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox", false));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent", false));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive", false));
  document.querySelector("#compose").addEventListener("click", compose_email);

  document.querySelector("form").onsubmit = () => {
    let recipients = document.querySelector("#compose-recipients").value;
    let subject = document.querySelector("#compose-subject").value;
    let body = document.querySelector("#compose-body").value;

    let email = new Object();
    email.recipients = recipients;
    email.subject = subject;
    email.body = body;

    fetch("/emails", {
      method: "POST",
      body: JSON.stringify(email),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.message) {
          document.querySelector(".error").style.display = "none";
          document.querySelector(".error").innerHTML = "";
          document.querySelector(".success").style.display = "block";
          document.querySelector(".success").innerHTML = result.message;

          load_mailbox("sent", true);
        } else {
          document.querySelector(".success").style.display = "none";
          document.querySelector(".success").innerHTML = "";
          document.querySelector(".error").style.display = "block";
          document.querySelector(".error").innerHTML = result.error;
        }
      });

    return false;
  };

  // By default, load the inbox
  load_mailbox("inbox", false);
});

function active_tab(id) {
  // remove active state of tab
  const navLink = document.getElementsByClassName("nav-link");
  for (let i = 0; i < navLink.length; i++) {
    navLink[i].classList.remove("active");
  }

  // add active state of this tab
  if (id === "archive") {
    id = "archived";
  }
  const thisLink = document.getElementById(id);
  thisLink.classList.add("active");
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector(".error").style.display = "none";
  document.querySelector(".success").style.display = "none";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
  document.querySelector(".error").innerHTML = "";
  document.querySelector(".success").innerHTML = "";

  active_tab("compose");
}

function reply_email(emailContents) {
  let replyDivider = "";
  let replySubjectHeader = "";

  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector(".error").style.display = "none";
  document.querySelector(".success").style.display = "none";
  document.querySelector(".error").innerHTML = "";
  document.querySelector(".success").innerHTML = "";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = emailContents.sender;

  if (emailContents.subject.indexOf("Re") === -1) {
    replySubjectHeader = "Re: ";
  }
  document.querySelector("#compose-subject").value =
    `${replySubjectHeader}` + emailContents.subject;

  let i = 0;
  while (i < 140) {
    replyDivider += "-";
    i++;
  }
  replyDivider +=
    "\n" +
    "On " +
    emailContents.timestamp +
    " " +
    emailContents.sender +
    " wrote: ";
  document.querySelector("#compose-body").value =
    "\n\n" + replyDivider + "\n" + emailContents.body;
}

function archive_email(id, archiveStateId) {
  let condition = true;
  if (archiveStateId === "unarchive") {
    condition = false;
  }

  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: condition,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.message) {
        document.querySelector(".error").style.display = "none";
        document.querySelector(".error").innerHTML = "";
        document.querySelector(".success").style.display = "block";
        document.querySelector(".success").innerHTML =
          result.message + ` ${archiveStateId}.`;

        load_mailbox("inbox", true);
      } else {
        document.querySelector(".success").style.display = "none";
        document.querySelector(".success").innerHTML = "";
        document.querySelector(".error").style.display = "block";
        document.querySelector(".error").innerHTML = result.error;
      }
    });
}

function load_mailbox(mailbox, alertDisplay) {
  active_tab(mailbox);

  if (!alertDisplay) {
    document.querySelector(".error").style.display = "none";
    document.querySelector(".success").style.display = "none";
    document.querySelector(".error").innerHTML = "";
    document.querySelector(".success").innerHTML = "";
  }

  const div = document.createElement("div");
  const emailView = document.querySelector("#emails-view");
  div.setAttribute("class", "list-group");

  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  emailView.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;
  emailView.append(div);

  fetch(`emails/${mailbox}`)
    .then((response) => response.json())
    .then((email) => {
      email.forEach((element) => {
        const a = document.createElement("a");
        const labelSender = document.createElement("label");
        const labelSubject = document.createElement("label");
        const labelTimestamp = document.createElement("label");
        a.setAttribute(
          "class",
          "list-group-item list-group-item-action inbx-clck read"
        );
        a.setAttribute("data-id", element.id);
        labelSender.setAttribute("class", "col-lg-4");
        labelSubject.setAttribute("class", "col-lg-4");
        labelTimestamp.setAttribute("class", "col-lg-4 text-right");

        labelSender.innerHTML = element.sender;
        labelSubject.innerHTML = element.subject;
        labelTimestamp.innerHTML = element.timestamp;
        a.append(labelSender);
        a.append(labelSubject);
        a.append(labelTimestamp);

        if (element.read === false) {
          a.classList.remove("read");
        }

        div.append(a);
      });

      document.querySelectorAll(".inbx-clck").forEach(function (a) {
        a.onclick = function () {
          document.querySelector(".error").style.display = "none";
          document.querySelector(".success").style.display = "none";
          document.querySelector(".error").innerHTML = "";
          document.querySelector(".success").innerHTML = "";

          const id = a.dataset.id;
          document.querySelector("#emails-view").innerHTML = "";

          fetch(`/emails/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              read: true,
            }),
          });

          fetch(`/emails/${id}`)
            .then((response) => response.json())
            .then((emailContents) => {
              let recipients = "";
              let i = 1;
              emailContents.recipients.forEach((value) => {
                recipients += value;
                if (emailContents.recipients.length > i) {
                  recipients += ", ";
                }
                i++;
              });

              let archiveStateId = "archive";
              let archiveStateTitle = "Archive";
              if (emailContents.archived === true) {
                archiveStateId = "unarchive";
                archiveStateTitle = "Unarchive";
              }
              const labelMailContentSender = document.createElement("label");
              const labelMailContentRecipients =
                document.createElement("label");
              const labelMailContentSubject = document.createElement("label");
              const labelMailContentTimestamp = document.createElement("label");
              const labelMailContentButtonReply =
                document.createElement("button");
              const labelMailContentButtonArchived =
                document.createElement("button");
              const labelMailContentDivCard = document.createElement("div");
              const labelMailContentDivCardBody = document.createElement("div");

              labelMailContentSender.setAttribute("class", "col-lg-12 pl-0");
              labelMailContentRecipients.setAttribute(
                "class",
                "col-lg-12 pl-0"
              );
              labelMailContentSubject.setAttribute("class", "col-lg-12 pl-0");
              labelMailContentTimestamp.setAttribute("class", "col-lg-12 pl-0");
              labelMailContentButtonReply.setAttribute(
                "class",
                "btn submit-button cstm-mrgn"
              );
              labelMailContentButtonReply.setAttribute("id", "reply");
              labelMailContentButtonArchived.setAttribute(
                "class",
                "btn submit-button cstm-mrgn"
              );
              labelMailContentButtonArchived.setAttribute("id", "archive");
              labelMailContentDivCard.setAttribute("class", "card");
              labelMailContentDivCardBody.setAttribute("class", "card-body");

              labelMailContentSender.innerHTML =
                '<label style="font-weight : bold">From :&nbsp;</label>' +
                emailContents.sender;
              labelMailContentRecipients.innerHTML =
                '<label style="font-weight : bold">To :&nbsp;</label>' +
                recipients;
              labelMailContentSubject.innerHTML =
                '<label style="font-weight : bold">Subject :&nbsp;</label>' +
                emailContents.subject;
              labelMailContentTimestamp.innerHTML =
                '<label style="font-weight : bold">Timestamp :&nbsp;</label>' +
                emailContents.timestamp;
              labelMailContentButtonReply.innerHTML = "Reply";
              labelMailContentButtonArchived.innerHTML = archiveStateTitle;
              labelMailContentDivCardBody.innerHTML =
                emailContents.body.replace(/\n\r?/g, "<br />");

              labelMailContentDivCard.append(labelMailContentDivCardBody);
              emailView.append(labelMailContentButtonReply);
              if (mailbox != "sent") {
                emailView.append(labelMailContentButtonArchived);
              }
              emailView.append(labelMailContentSender);
              emailView.append(labelMailContentRecipients);
              emailView.append(labelMailContentSubject);
              emailView.append(labelMailContentTimestamp);
              emailView.append(labelMailContentDivCard);

              document
                .querySelector("#reply")
                .addEventListener("click", () => reply_email(emailContents));
              document
                .querySelector("#archive")
                .addEventListener("click", () =>
                  archive_email(id, archiveStateId)
                );
            });
        };
      });
    });
}
