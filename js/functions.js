//handle favorite button
document.getElementById('btn-favorite').addEventListener('click', (event) => {
    event.preventDefault();
    const id = document.getElementById('restaurant-id').innerHTML;
    const btn = document.getElementById('btn-favorite');
    if(btn.innerHTML == "ADD TO FAVORITE"){
        DBHelper.Favorite(id);
        btn.innerHTML = "REMOVE FROM FAVORITE";
        console.log('added');
    }
    else{
        DBHelper.UnFavorite(id);
        btn.innerHTML = "ADD TO FAVORITE";
        console.log('removed');
    }
    
});

//show the form to add a new review
document.getElementById('btn-show-review').addEventListener('click', () => {
    document.getElementById('form-review').style.display = "block";    
});

//handle the event that will post the a new review on the server 
document.getElementById('btn-submit-review').addEventListener('click', (event) => {
    event.preventDefault();

    let name = document.getElementsByName('reviewer_name')[0].value;
    let comments = document.getElementsByName('comment_text')[0].value;
    let rating = "";

    const radios = document.getElementsByName('rating');
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            rating = radios[i].value;
            break;
        }
    }


    if((name == "") || (rating == "") || (comments == "")){
        alert("please fill all fields");
        return;
    }

    review = {};
    review.restaurant_id = document.getElementById('restaurant-id').innerHTML;
    review.name = name;
    review.rating = rating;
    review.comments = comments;

    console.log(review);
    DBHelper.addNewReview(review);

    setTimeout(function(){ 
      alert("Review successfully added")
    }, 200);

    fillReviewHTML(review);
    document.getElementById('form-review').reset();
    document.getElementById('form-review').style.display = "none";
    console.log('end event');


});


//show map carte
/*document.getElementById('btn-display-map').addEventListener('click', () => {
    document.getElementById("btn-display-map").style.display = "none";
    document.getElementById("btn-hide-map").style.display = "block";
    document.getElementById("map-container").style.display = "block";
    document.getElementById("map").style.display = "block";    
}); 

//show controls buttons
document.getElementById('btn-display-controls').addEventListener('click', () => {
    document.getElementById("btn-display-controls").style.display = "none";
    document.getElementById("control-contain").style.display = "block";
    document.getElementById("btn-display-reviews-list").style.display = "block"; 
    document.getElementById("btn-display-map").style.display = "block";
    document.getElementById("btn-hide-form").style.display = "none";
    document.getElementById("btn-hide-map").style.display = "none";
    document.getElementById("btn-hide-reviews-list").style.display = "none";
    document.getElementById("btn-hide-controls").style.display = "block";   
}); 

//hide controls buttons
document.getElementById('btn-hide-controls').addEventListener('click', () => {
    document.getElementById("btn-hide-controls").style.display = "none"; 
    document.getElementById("btn-display-controls").style.display = "block";
    document.getElementById("control-contain").style.display = "none";   
});

//hide map carte
document.getElementById('btn-hide-map').addEventListener('click', () => {
    document.getElementById("btn-hide-map").style.display = "none"; 
    document.getElementById("btn-display-map").style.display = "block";
    document.getElementById("map-container").style.display = "none";   
});



//show reviews list
document.getElementById('btn-display-reviews-list').addEventListener('click', () => {
    document.getElementById("btn-display-reviews-list").style.display = "none"; 
    document.getElementById("btn-hide-reviews-list").style.display = "block";
    document.getElementById("reviews-list").style.display = "block";   
});

//hide reviews list
document.getElementById('btn-hide-reviews-list').addEventListener('click', () => {
    document.getElementById("btn-hide-reviews-list").style.display = "none";
    document.getElementById("reviews-list").style.display = "none";  
    document.getElementById("btn-display-reviews-list").style.display = "block";  
});*/