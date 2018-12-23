/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 8000 // Change this to your server port
    return `http://localhost:1337/restaurants`;
  }

  //connecting to local storage
  static idbStorage() {
    var dbPromise = idb.open('restaurant-db', 4, function(upgradeDb) {
      switch(upgradeDb.oldVersion){
        case 0:
          var store = upgradeDb.createObjectStore('restaurant-store', {
            keyPath: 'id'
          });
          store.createIndex('by-neighborhood', 'neighborhood');
          store.createIndex('by-cuisine', 'cuisine_type');
        case 1:
          upgradeDb.createObjectStore('list-reviews');
        case 2:
          var reviewsStorage = upgradeDb.transaction.objectStore('list-reviews');
          reviewsStorage.createIndex('restaurant-reviews', 'restaurant_id');
        case 3:
          upgradeDb.createObjectStore('list-favorite-restaurants');
        case 4:
          upgradeDb.createObjectStore('pending-reviews');
      }
    });
    return dbPromise;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    /* Creates local db, object store, and indexes for sorting */
    const dbPromise = DBHelper.idbStorage();

    dbPromise.then (function(db) {
      var tx = db.transaction('restaurant-store', 'readwrite');
      var res = tx.objectStore('restaurant-store');
      return res.getAll();
    }).then(function(restaurants) {
      // if any restaurants are returned from local db call them back
      if (restaurants.length !==0){
        callback(null, restaurants);
      } else {
        // if no restaurants were returned from local db fetch restaurants from server
        fetch (`http://localhost:1337/restaurants`)
        .then(function(response) {
          return response.json();
        })
        .then(function(restaurants) {
          // put restaurants from server into local db
          dbPromise.then(function(db){
            var tx = db.transaction('restaurant-store', 'readwrite');
            var res = tx.objectStore('restaurant-store');
            restaurants.forEach(
              restaurant => res.put(restaurant)
            ); 
            callback(null, restaurants);
            return tx.complete; 
          });

          });
      }
    }).then(function(){
        console.log("added restaurants");
      }).catch(function(error){
        console.log(error);
      }); // end of dbPromise.then      


    /*fetch('http://localhost:1337/restaurants')
      .then(res => {
        return res.json();
      })
      .then(data => callback(null, data))
      .catch(error => callback(`The request failed. Status: ${error.statusText}`, null));*/
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          console.log(restaurant);
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.id == 10){
      return (`./img/10.jpg`);
    }
    else{
      return (`./img/${restaurant.photograph}.jpg`);
    }
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

  //------------------------------------added functions-------------------------------------------

  // Favorite a restaurant
  static Favorite(id){
    const query = `http://localhost:1337/restaurants/${id}/?is_favorite=true`;
    fetch(query, {
      method: 'post'
    }).then((resp) => {
      console.log(resp);
      var dbPromise = DBHelper.idbStorage();
      if (resp.status === 200) {
          dbPromise.then((db) => {
          const tx = db.transaction('list-favorite-restaurants', 'readwrite');
          const objectStore = tx.objectStore('list-favorite-restaurants');
          const key = "favorites-"+id;
          objectStore.put(id, key);
          return tx.complete;
      });
      }
    }).catch((error) => {
      console.log(error);
    });
  }
  
  
  // Unfavorite a restaurant
  static UnFavorite(id){
    const query = `http://localhost:1337/restaurants/${id}/?is_favorite=false`;
    fetch(query, {
      method: 'post'
    }).then((resp) => {
      console.log(resp);
      var dbPromise = DBHelper.idbStorage();
      dbPromise.then((db) => {
        const tx = db.transaction('list-favorite-restaurants', 'readwrite');
        const objectStore = tx.objectStore('list-favorite-restaurants');
        objectStore.delete("favorites-"+id);
        return tx.complete;
      })
    }).catch((error) => {
      console.log(error);
    });
  }


  //check if retaurant is favorite
  static isFavorite(restaurant, content){
    var dbPromise = DBHelper.idbStorage();
      dbPromise.then((db) => {
          const tx = db.transaction('list-favorite-restaurants');
          const objectStore = tx.objectStore('list-favorite-restaurants');
          return objectStore.getAll();
      }).then((favoriteList) => {
        console.log(favoriteList);
        console.log(favoriteList.indexOf(restaurant));
        console.log(restaurant);
            if(favoriteList.indexOf(restaurant) != -1)
              content.innerHTML = "REMOVE FROM FAVORITE"
            else
              content.innerHTML = "ADD TO FAVORITE"
        }).catch((error) => {
          console.log(error);        
        });

  }


  static fetchReviews(id) {
    //try to fetch data to the local storage before going to the network
    const query = "http://localhost:1337/reviews/?restaurant_id="+id;
    var dbPromise = DBHelper.idbStorage();
    fetch(query).then((resp) => { 
          return resp.json();
        }).then((reviewsList) => {
          console.log(reviewsList);
          const dbPromise = DBHelper.idbStorage();
          dbPromise.then((db) => {
          const tx = db.transaction('list-reviews', 'readwrite');
          const reviewsStorage = tx.objectStore('list-reviews');
            reviewsList.forEach((review) => {
              console.log(review)
              reviewsStorage.put(review, review.id);
              fillReviewHTML(review);
            });
            return tx.complete; 
          });
      }).catch((error) => {
        dbPromise.then((db) => {
        const tx = db.transaction('list-reviews');
        const reviewsStorage = tx.objectStore('list-reviews');
        const restaurantIndex = reviewsStorage.index('restaurant-reviews')
          return restaurantIndex.getAll(id);
        }).then((data_reviews) => {
            //if there is no data store, fetch from the local server
            data_reviews.forEach((review) => {
              fillReviewHTML(review);
            });
        }).catch((error) => {
          console.log(error);
          
        });
      });
  }
  
  static fetchFavorite() {
    //try to fetch data to the local storage before going to the network
    const query = "http://localhost:1337/restaurants/?is_favorite=true";
    var dbPromise = DBHelper.idbStorage();
    fetch(query).then((resp) => { 
          return resp.json();
        }).then((favoriteList) => {
          console.log(favoriteList);
          const dbPromise = DBHelper.idbStorage();
          dbPromise.then((db) => {
          const tx = db.transaction('list-favorite-restaurents', 'readwrite');
          const favoriteStorage = tx.objectStore('list-favorite-restaurents');
            favoriteList.forEach((favorite) => {
              console.log(favorite)
              //const key = "favorites-"+id;
              favoriteStorage.put(favorite.id, 'key');
              //fillReviewHTML(favorite);
            });
            return tx.complete; 
          });
      }).catch((error) => {
        dbPromise.then((db) => {
        const tx = db.transaction('list-favorite-restaurents');
        const favoriteStorage = tx.objectStore('list-favorite-restaurents');
          return favoriteStorage.getAll();
        }).then((favoriteList) => {
            //if there is no data store, fetch from the local server
            favoriteList.forEach((favorite) => {
              //fillReviewHTML(review);
              console.log(favorite);
            });
        }).catch((error) => {
          console.log(error);
          
        });
      });
  }
  
  /**
  *function that will call to post review server
  */
  
   
  static addNewReview(review) {
    const url = 'http://localhost:1337/reviews/';
    fetch(url, {
      method: 'post',
      headers: {"Content-type": "application/json; charset=UTF-8"},
      body:JSON.stringify(review)
    }).then((resp) => { 
      return resp.json();
    }).then((data) => {
      var dbPromise = DBHelper.idbStorage();
      dbPromise.then((db) => {
        const tx = db.transaction('list-reviews', 'readwrite');
        const objectStore = tx.objectStore('list-reviews');
        objectStore.put(data, data.id);
        return tx.complete;
      }).then((data) => {
        console.log('your new reviews has been posted')
      })
      console.log('Request succeeded with JSON response', data);
    }).catch((error) => {
        console.log('an error happen', error);
        var dbPromise = DBHelper.idbStorage();
        dbPromise.then((db) => {
          const tx = db.transaction('pending-reviews', 'readwrite');
          const objectStore = tx.objectStore('pending-reviews');
          objectStore.put(review, review.restaurant_id);
          return tx.complete;
      });
    });    
  }
  
  
  
  
  
}

