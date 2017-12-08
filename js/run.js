$(document).ready(function(){
    loadAJAX();
    // loadJSON();
});


function loadAJAX(){
    $('#products').shopcart('#cart.container', {
        'catTitle': 'products (AJAX)',
        'products_load_url': 'http://wpwith.us/experis/cart-products-ajax.php',
        'url_load_page_count': 12,
        'paypal': {
            'currency_code': 'ILS',
            'business': 'm.dofo123@gmail.com',
            'image_url': 'https://cdn1.iconfinder.com/data/icons/ninja-things-1/1772/ninja-128.png'
        }
    });
};

function loadJSON(){
    for(var i = 0; i < categories.length; ++i){
        var category = categories[i];

        $(category.selector).shopcart('#cart.container', {
            'catTitle': category.name,
            products_load_json: category.items
        });
    }
};