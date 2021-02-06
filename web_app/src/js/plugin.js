// css
import "../css/style.scss";
// js
import * as camera from "./camera";

(function () {
  window.onload = (e) => {
    // selectors
    let CROPED_BASE64 = null;
    let ID_LOADING = "loading";
    let CLASS_CAPTURE = "capture";
    let CLASS_CURRENT = "navigation-bar__item--current";
    let CLASS_FAB = "navigation-bar__fab";
    let ATT_GOTO = "goto";
    let CLASS_NAVIGATION_BAR_ITEM = "navigation-bar__item";
    let ID_SEND_BUTTON = "send_picture";
    let ID_CLOSE_SHOWCASE = "close_showcase";
    let BASE64_IMG = null;
    let MODAL_ID = "modal";
    let FOLDERS_SELECT_ID = "folder";
    let IMAGE_NAME_INPUT_ID = "filename";
    let MODAL_SUBMIT_ID = "modal_submit";
    let MODAL_CLOSE_ID = "modal_close";
    // elements
    let loading = document.getElementById(ID_LOADING);
    let fab = document.querySelector(`.${CLASS_FAB}`);
    let currentActive = (_) => document.querySelector(`.${CLASS_CURRENT}`);
    let sendButton = document.getElementById(ID_SEND_BUTTON);
    let closeShowcase = document.getElementById(ID_CLOSE_SHOWCASE);
    //modal
    let modal = document.getElementById(MODAL_ID);
    let folderSelect = document.getElementById(FOLDERS_SELECT_ID);
    let submitModal = document.getElementById(MODAL_SUBMIT_ID);
    let closeModal = document.getElementById(MODAL_CLOSE_ID);
    let IMAGE_NAME_INPUT = document.getElementById(IMAGE_NAME_INPUT_ID);
    // GET API key FROM HEADER
    let {
      "removebg-api-key": REMOVE_BG_API_KEY,
      "workspace-folders": WORKSPACE_FOLDER,
      token: SEC_TOKEN,
    } = ((_) => {
      let req = new XMLHttpRequest();
      req.open("GET", document.location, false);
      req.send(null);
      return req
        .getAllResponseHeaders()
        .split("\r\n")
        .reduce(function (final, header) {
          let splited_header = header.split(":");
          final[splited_header[0]] = splited_header[1];
          return final;
        }, {});
    })();

    /*
     * App pages
     */
    let pages = ["camera", "showcase", "info"];

    /*
     * A simple pagination function
     */
    function goto(myPage) {
      if (!myPage) return;
      if (myPage == "camera" && !camera.allow_camera_page) {
        alert("Error : please make sure camera is enbaled!");
        return;
      }
      // get page
      pages.forEach((page) => {
        if (page == myPage) {
          document.getElementById(page).style.top = "0";
        } else {
          document.getElementById(page).style.top = null;
        }
      });
      // add or remove camera icon and pause/play video
      if (myPage == "camera") {
        camera.playVideo();
        currentActive()?.classList.remove(CLASS_CURRENT);
        fab.classList.add(CLASS_CAPTURE);
      } else {
        camera.stopVideo();
        fab.classList.remove(CLASS_CAPTURE);
      }
      //add active class to NAVIGATION_BAR
      if (myPage == "home" || myPage == "info") {
        currentActive()?.classList.remove(CLASS_CURRENT);
        document
          .querySelector(`a[goto=${myPage}]`)
          .classList.add(CLASS_CURRENT);
      }
    }

    /*
     * Lazy load removeBG class and send
     */
    sendButton.onclick = (_) => {
      // show loading
      loading.style.display = "flex";
      // lazy import class
      import(
        /* webpackChunkName: "remove"*/
        "./remove-bg"
      ).then(async (module) => {
        // initialize class and call removeByApi method
        new module.default(BASE64_IMG)
          .removeByApi(REMOVE_BG_API_KEY)
          .then(function (res) {
            if (!res.ok) {
              let message = "Something went wrong, please try agian later";
              // return error title from api response
              return res.json().then((json) => {
                if (json && json.errors && json.errors[0]) {
                  message = json.errors[0].title;
                }
                alert("API ERROR : " + message);
                loading.style.display = null;
              });
            }
            return res;
          })
          // read the stream and send base64 img to VSvode
          .then(async (response) => {
            await response?.json().then((body) => {
              // change image value
              CROPED_BASE64 = body.data.result_b64;
              // hide loading
              loading.style.display = null;
              // show  infos modal
              modal.style.top = "0";
              // wait for modal submit
              return new Promise((resolve, reject) => {
                submitModal.addEventListener(
                  "click",
                  function (e) {
                    // once clicked resolve and send to vs code
                    resolve(
                      sendToVScode(
                        IMAGE_NAME_INPUT.value,
                        folderSelect.value,
                        CROPED_BASE64
                      )
                    );
                  },
                  { once: true }
                );
              });
            });
            // .then((body) => sendToVScode(body.data.result_b64));
          })
          // catch errors
          .catch(function (error) {
            console.log(error);
            alert(
              "ERROR : Network request failed, check your internet or try again later. \n" +
              error?.message
            );
            loading.style.display = null;
          });
      });
    };

    /*
     * Close Showcase Screen and go back to camera
     */
    closeShowcase.onclick = function () {
      goto("camera");
    };

    /*
     * Listen to any other click on the body
     */
    document.body.onclick = (event) => {
      // check if clicked element is either our fab button or NAVIGATION_BAR button
      if (
        event.target != fab &&
        !event.target.classList.contains(CLASS_NAVIGATION_BAR_ITEM)
      )
        return;
      // take a shot if clicked element is fab button and it contains capture class, then more to showcase screen
      if (event.target == fab && fab.classList.contains(CLASS_CAPTURE)) {
        camera.capture().then((img) => {
          BASE64_IMG = img;
          goto("showcase");
        });
      } else {
        goto(event.target.getAttribute(ATT_GOTO));
      }
    };

    // fill the folders select
    WORKSPACE_FOLDER?.split("#").map((folder, index) => {
      let option = document.createElement("option");
      option.text = folder;
      option.value = index;
      folderSelect.add(option);
    });

    // submit modal
    // submitModal.onclick = (_) =>
    //   sendToVScode(IMAGE_NAME_INPUT.value, folderSelect.value, CROPED_BASE64);

    // close modal
    closeModal.onclick = (_) => (modal.style.top = null);

    /*
     * Once we submit our modal, this function will send the base64, name, and image location to the VScode extention to be saved
     */
    function sendToVScode(name, folder, base64) {
      let image = `data:image/png;base64,${base64}`;
      // send to vs code
      return fetch("/imgBase64", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: name,
          folder,
          imgBase64: image,
        }),
      })
        .then((res) => (res.ok ? res.json() : alert("Something went wrong")))
        .then((body) => {
          alert(body.message);
          modal.style.top = null;
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // start camera
    camera.start();
    // add updateFrame function to the global scope so we can use it in ranges onchange
    window.updateViewfinder = camera.updateViewfinder;
    // copy link 
    window.copyLink = el => {
      let selection = window.getSelection();
      let range = document.createRange();
      range.selectNodeContents(el);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("Copy");
      alert("Link copied, now open a new tab and past it into the address bar, then add " + location.href + " to the textarea and click on relaunch.\n\nNB: These kind of links are secured and cannot accessed onclick, therefore you have to access it manually.");
    }
    // full screen : https://developers.google.com/web/fundamentals/native-hardware/fullscreen/
    window.toggleFullScreen = el => {
      var doc = window.document;
      var docEl = doc.documentElement;

      var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
      var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

      if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
        el?.classList.replace('fa-expand', 'fa-compress');
      }
      else {
        cancelFullScreen.call(doc);
        el?.classList.replace('fa-compress', 'fa-expand');
      }
    }
  };
})();
