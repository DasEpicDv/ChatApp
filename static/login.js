var n = "#{name}";
document.querySelector(".sign-up-htm").addEventListener("submit", (async (e) => {
  e.preventDefault();
  document.querySelectorAll(".sign-up-htm > .wrongLabel").forEach(element => element.innerText = "");
  $i = 0;
  body = {

  };
  while ($i < 4) {
    body[e.target[$i].name] = e.target[$i].value;
    $i++;
  }
  const rawResponse = await fetch('/requests/register', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    "body": JSON.stringify(body)
  });
  const content = await rawResponse.json();
  if (typeof (content["done"]) === "undefined") {
    for (const key in content) {
      let child = document.querySelector(`.sign-up-htm input[name='${key}']`).parentElement.childNodes;
      let label = child.item(2).nextSibling;
      label.innerText = content[key];
    }
  } else {
    window.location.href = "/login";
  }
}));