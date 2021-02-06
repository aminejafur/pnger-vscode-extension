export default class Remove {
  /*
   * Constructor
   */
  constructor(img) {
    this.img = img;
  }

  /*
   * Send Image to RemoveBg API
   */
  async removeByApi(key) {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": key,
      },
      body: JSON.stringify({
        image_file_b64: this.img,
        size: "auto",
      }),
    });

    return response;
  }

  /*
   * Remove green screen from image
   */
  nativeRemove() {
    console.log("nativeRemove");
  }
}
