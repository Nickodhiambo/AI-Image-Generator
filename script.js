const generateForm = document.querySelector(".generate-form");
const imgGallery = document.querySelector(".image-gallery");

const OPENAI_API_KEY = "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";

let isImageGenerating = false;

const handleFormSubmission = (e) => {

    // Prevent new request from processing while
    // a previous one is in progress
    if (isImageGenerating){
        return;
    }
    isImageGenerating = true;

    // Prevent user from submitting an empty form
    e.preventDefault();

    // Extract user prompt and number of images to 
    // return from form
    const userPrompt = e.srcElement[0].value;
    const imgQty = e.srcElement[1].value;

    // Create a HTML markup for image card
    // To display while the AI image is being loaded
    const imageCardMarkUp = Array.from({length: imgQty}, () =>
        `
        <div class="image-card loading">
                <img src="images/loader.svg" alt="image">
                <a href="" class="download-btn">
                    <img src="images/download.svg" alt="download icon">
                </a>
            </div>`
    ).join();

    imgGallery.innerHTML = imageCardMarkUp;
    generateAiImage(userPrompt, imgQty);
}

const generateAiImage = async (userPrompt, imgQty) => {
    try{
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                prompt: userPrompt,
                n: parseInt(imgQty),
                size: "512x512",
                response_format: "b64_json"
            })
        });

        if (!response.ok){
            console.log("Failed to generate images. Please try again");
        }

        const { data } = await response.json();
        updateImageCard([...data]);

    } catch(error) {
        console.log(error);
    } finally {
        isImageGenerating = false;
    }
}

const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObj, index) => {
        const imgCard = imgGallery.querySelectorAll(".image-card")[index];
        const imgElement = imgCard.querySelector("img");
        const downloadBtn = imgCard.querySelector(".download-btn");

        const aiGeneratedImg = `data:image/jpeg;base64,${imgObj.b64_json}`;
        imgElement.src = aiGeneratedImg;

        // Remove loading class once AI image loads and assign it download attributes
        imgElement.onload = () => {
            imgCard.classList.remove("loading");
            downloadBtn.setAttribute("href", aiGeneratedImg);
            downloadBtn.setAttribute("download", `${new Date().setTime()}.jpg`);
        }
    });
}

generateForm.addEventListener("submit", handleFormSubmission);