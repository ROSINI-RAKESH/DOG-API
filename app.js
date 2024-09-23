const accessKey = "live_SbN6iEd31d92nmjM7pAC6eJXZPzbVvEC2c396zO29P7kwrOk96JnU1nsHOeqnZJc";

const form1 = document.getElementById("search-form");
const input1 = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const showMore = document.getElementById("show-more-button");
const likedSection = document.querySelector('h2'); // Select the liked section text
const likedResults = document.getElementById("liked-results");

let inputData = "";
let page = 1;
let allResults = [];
let likedImages = new Set();
let originalLocations = new Map();

async function displayDefaultImages() {
    const url = `https://api.thedogapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&limit=10`;

    const response = await fetch(url, {
        headers: {
            'x-api-key': accessKey
        }
    });
    const data = await response.json();

    data.forEach((result) => {
        const imageWrapper = createImageWrapper(result);
        searchResults.appendChild(imageWrapper);
        originalLocations.set(result.url, imageWrapper);
    });
}

async function searchImages() {
    inputData = input1.value.toLowerCase();
    const url = `https://api.thedogapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&limit=50`;

    const response = await fetch(url, {
        headers: {
            'x-api-key': accessKey
        }
    });
    const data = await response.json();

    if (page === 1) {
        searchResults.innerHTML = "";
        allResults = data.filter(result =>
            result.breeds[0]?.name.toLowerCase().includes(inputData)
        );

        if (allResults.length === 0) {
            searchResults.innerHTML = "<p class='no-results'>Image not found!</p>";
            showMore.style.display = "none";
            likedSection.style.display = "none"; // Hide liked section text
            likedResults.style.display = "none"; // Hide liked images
            return;
        } else {
            likedSection.style.display = "block"; // Show liked section text
            likedResults.style.display = "block"; // Show liked images
        }
    }

    const resultsToShow = allResults.slice((page - 1) * 10, page * 10);
    resultsToShow.forEach((result) => {
        const imageWrapper = createImageWrapper(result);
        searchResults.appendChild(imageWrapper);
        originalLocations.set(result.url, imageWrapper);
    });

    page++;
    if (page * 10 < allResults.length) {
        showMore.style.display = "block";
    } else {
        showMore.style.display = "none";
    }
}

function createImageWrapper(result) {
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('search-result');

    const image = document.createElement('img');
    image.src = result.url;
    image.alt = result.breeds[0]?.name || 'Unknown breed';

    const imageLink = document.createElement('a');
    imageLink.href = result.url;
    imageLink.target = "_blank";
    imageLink.textContent = result.breeds[0]?.name || 'Unknown breed';

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const likeButton = document.createElement('button');
    likeButton.classList.add('like-button');
    likeButton.innerHTML = likedImages.has(result.url) ? '<span style="color: red;">&#9829;</span> Liked' : '<span>&#9825;</span>'; // Heart icon
    likeButton.addEventListener('click', () => toggleLike(likeButton, result.url, imageWrapper));

    const unlikeButton = document.createElement('button');
    unlikeButton.classList.add('unlike-button');
    unlikeButton.textContent = 'Unlike';
    unlikeButton.style.display = likedImages.has(result.url) ? 'inline' : 'none';
    unlikeButton.addEventListener('click', () => {
        likedResults.removeChild(imageWrapper);
        likedImages.delete(result.url);
        originalLocations.get(result.url).querySelector('.like-button').innerHTML = '<span>&#9825;</span>';
        originalLocations.get(result.url).querySelector('.like-button').classList.remove('liked');
        originalLocations.get(result.url).querySelector('.unlike-button').style.display = 'none';
        searchResults.appendChild(originalLocations.get(result.url));
    });

    buttonContainer.appendChild(likeButton);
    buttonContainer.appendChild(unlikeButton);

    imageWrapper.appendChild(image);
    imageWrapper.appendChild(imageLink);
    imageWrapper.appendChild(buttonContainer);

    return imageWrapper;
}

function toggleLike(button, imageUrl, imageWrapper) {
    if (likedImages.has(imageUrl)) {
        likedImages.delete(imageUrl);
        button.innerHTML = '<span>&#9825;</span>'; // Heart icon
        imageWrapper.querySelector('.unlike-button').style.display = 'none';
        moveImageBackToOriginalSection(imageWrapper, imageUrl);
    } else {
        likedImages.add(imageUrl);
        button.innerHTML = '<span style="color: red;">&#9829;</span> Liked';
        imageWrapper.querySelector('.unlike-button').style.display = 'inline';
        moveImageToLikedSection(imageWrapper);
    }
}

function moveImageToLikedSection(imageWrapper) {
    if (searchResults.contains(imageWrapper)) {
        likedResults.appendChild(imageWrapper.cloneNode(true));
        searchResults.removeChild(imageWrapper);

        const clonedImageWrapper = likedResults.lastChild;
        clonedImageWrapper.querySelector('.like-button').addEventListener('click', () => toggleLike(clonedImageWrapper.querySelector('.like-button'), clonedImageWrapper.querySelector('img').src, clonedImageWrapper));
        clonedImageWrapper.querySelector('.unlike-button').addEventListener('click', () => {
            likedResults.removeChild(clonedImageWrapper);
            likedImages.delete(clonedImageWrapper.querySelector('img').src);
            originalLocations.get(clonedImageWrapper.querySelector('img').src).querySelector('.like-button').innerHTML = '<span>&#9825;</span>';
            originalLocations.get(clonedImageWrapper.querySelector('img').src).querySelector('.like-button').classList.remove('liked');
            originalLocations.get(clonedImageWrapper.querySelector('img').src).querySelector('.unlike-button').style.display = 'none';
            searchResults.appendChild(originalLocations.get(clonedImageWrapper.querySelector('img').src));
        });
    }
}

function moveImageBackToOriginalSection(imageWrapper, imageUrl) {
    const originalLocation = originalLocations.get(imageUrl);
    if (originalLocation) {
        originalLocation.appendChild(imageWrapper);
        originalLocations.delete(imageUrl);
    }

    if (likedResults.contains(imageWrapper)) {
        likedResults.removeChild(imageWrapper);
    }
}

form1.addEventListener("submit", (event) => {
    event.preventDefault();
    page = 1;
    searchImages();
});

showMore.addEventListener("click", () => {
    searchImages();
});

window.onload = () => {
    displayDefaultImages();
};
