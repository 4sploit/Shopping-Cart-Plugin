$(function( $ ){
	function Shop(category, cartContainer, settings){
		var Cart = function(container){
			var productsRecords = {};
			// cart initiator
			var cartTable = (function init(container){
				var cartTbl;

				if(typeof container != 'object'){
					container = $(container);
				}

				if(container[0].innerText == ""){
					cartTbl = createCart();
					container.append(cartTbl);
				}
				else{
					cartTbl = container.children('table');
				}

				return cartTbl;
			}(container));

			function createCart(){
				var cartTable = $('<table>', { class: 'cart'});
				var caption = $('<caption>').html('Cart');
				var thead = $('<thead>');
				var tbody = $('<tbody>');
				var tfoot = $('<tfoot>');

				var heading = $('<tr>');
				var foot = $('<tr>');

				(function setTitles(){
					var titles = ['image','name','price','qty','total', ''];

					for(var i in titles){
						var title = titles[i];
						heading.append( $('<th>').html(title) );
					};
				}());

				(function setFooter(){
					for(var i = 0; i < 3; ++i){
						foot.append( $('<td>') );						
					};

					var totalQuantity = $('<td>', {class: 'totalQuantity'});
					var total = $('<td>', {class: 'total'});

					totalQuantity.html('0');
					total.html('0');

					foot.append(totalQuantity, total, $('<td>'));
				}());

				cartTable.append( caption, thead.append(heading) )
						 .append( tbody, tfoot.append(foot)  );
				
				return cartTable;
			};

			function itemDeletion(){
				var record = $(this).parent().parent();
				var sku = record.data('itemData').sku;
				record.remove();
				delete productsRecords[sku];
				updateTotal();
			};

			function itemUpdating(){
				var record = $(this).parent().parent();
				var itemData = record.data('itemData');
				var price = parseFloat(itemData.price);
				var quantity = parseInt($(this).val());
				var unitTotalEl = record.find('span.unitTotal');

				var unitTotal = price * quantity;
				unitTotal = Number(unitTotal).toFixed(2);

				unitTotalEl.text(unitTotal);
				updateTotal();
			};

			function addItem(data){
				if(data.sku in productsRecords){
					updateItem(data);
					updateTotal();
					return;
				};

				var record = $('<tr>').data('itemData',data);
				var itemObj = Item(data);
				
				for(var property in itemObj){
					var field = $('<td>');

					field.append(itemObj[property]);
					record.append(field);
				};

				var tbody = cartTable.find('tbody');
				tbody.append(record);
				productsRecords[data.sku] = record;
				updateTotal();
			};

			function updateItem(data){
				var record = productsRecords[data.sku];
				var quantityEl = record.find('input.quantityEl');
				var unitTotalEl = record.find('span.unitTotal');
				var price = parseFloat(data.price);

				newQuantity = parseInt(quantityEl.val()) + 1;
				quantityEl.val(newQuantity);

				var unitTotal = price * newQuantity;
				unitTotal = Number(unitTotal).toFixed(2);
				
				unitTotalEl.text(unitTotal);
			};
			
			function Item(product){
				var image = $('<img>', {class: 'prodPhoto', src: product.image});
				var name = $('<span>').html(product.name);
				var price = $('<span>', {class: 'unitPrice'}).text(product.price);
				var unitTotal = $('<span>', {class: 'unitTotal'}).text(product.price);
				var delBtn = $('<span>', { class: 'deleteBtn' }).html('X');
				var quantityEl =  $('<input>', {
					type: 'number', min: "1", 
					max: "100",value: '1',class: 'quantityEl'
				});
				
				quantityEl.on('input',itemUpdating);
				delBtn.on('click', itemDeletion);

				return {
					'image': image,
					'name': name,
					'price': price,
					'quantity': quantityEl,
					'unitTotal': unitTotal,
					'delBtn': delBtn
				};
			};

			function updateTotal(){
				var totals = 0, quantities = 0;
				// total calculation
				(function calculateTotal(){
					var records = cartTable.find('tbody tr');

					records.each(function(i){
						var record = records.eq(i);
						var unitQuantities = record.find('input.quantityEl');
						var unitTotals = record.find('span.unitTotal');

						totals = Number(parseFloat(totals) + parseFloat(unitTotals.text())).toFixed(2);
						quantities += parseInt(unitQuantities.val());
					});
				}());
				// total evaluation
				(function evalTotal(){
					var totalQtEl = cartTable.find('tfoot td.totalQuantity');
					var totalEl = cartTable.find('tfoot td.total');

					totalEl.text(totals);
					totalQtEl.text(quantities);
				}());
			};

			function getData(){
				var data = [];
				var records = cartTable.find('tbody tr');

				for(var i = 0; i < records.length; ++i){
					var name = records.eq(i).data('itemData').name;
					var price = records.eq(i).data('itemData').price;
					var quantityEl = records.find('input.quantityEl').eq(i);
					var quantity = quantityEl.val();
					var sku = records.eq(i).data('itemData').sku;

					data.push({
						'name': name,'unitPrice': price,
						'quantity': quantity,'sku': sku
					});
				}

				return data;
			};

			function fixOnScroll(){
				var $container = $(cartContainer).parent();

				if ($(window).scrollTop() > 100){
					$container.css({
						'position': 'fixed',
						'top': '100',
						'right': '5%'
					});
				}
				else{
					$container.css({
						'position': 'absolute',
						'top': '0',
						'right': '0'
					});
				}
			};

			$(window).scroll(fixOnScroll);

			return {
				'addItem': addItem,
				'getData': getData
			};
		};

		var Category = function(category, name){
			(function setName(){
				var title = $('<h1>').text(name);
				category.append(title);
			}());

			function getProductsContainer(){
				var prodsContainer = $('<div>', { class: 'productsList' });
				category.append(prodsContainer);

				return prodsContainer;
			};

			return {
				'getProductsContainer': getProductsContainer
			};
		};

		var ProductsList = function(prodsContainer, cart){
			function Product(sku, image, name, price){
				this.image = $('<img>').attr({src: image});
				this.name = $('<h2>').html(name);
				this.price = $('<h3>').html('&#8362; ' + price);
				this.addToCartBtn = $('<input>',{
					src: 'images/cart.png',
					class: 'addToCartBtn',
					type: 'image'
				});

				setAddToCartBtn(this.addToCartBtn, {
					sku: sku, image: image,
					name: name, price: price
				});
			};

			function setAddToCartBtn(addToCartBtn, data){
				function addToCart(){
					var data = $(this).data('product');
					cart.addItem(data);
				};

				addToCartBtn.on('click', addToCart);
				addToCartBtn.data('product', data);
			};			

			function addProduct(product){
				var prod = $('<div>', { class: 'product' });

				for(var i in product){
					var field = product[i];

					prod.append(field);
				};

				return prod;
			};

			function bindList(products){
				for(var i in products){
					var product =  products[i];

					var productContainer = addProduct(new Product(
						product.sku, product.image,
						product.name, product.price
					));

					prodsContainer.append(productContainer);
				};
			};

			function handleScroll(url, start, end){
				$(window).on('scroll',function(){
					if($(window).scrollTop() == $(document).height() - $(window).height() ){
						callAjax(url, start, end*2);
						start = end+1;
						end = start * 2;
					}
				});
			};

			function callAjax(url, start, end){
				$.ajax({
					url: url,
					type: 'POST',
					dataType: 'json',
					crossDomain: true,
					cache: false,
					data: {from: start, to: end},
					success: function (data)
					{
						bindList(data);
					}
				});
			};

			function loadAJAX(url, start, end){
				callAjax(url, start, end);
				handleScroll(url, end+1, (end+1)*2);
			};

			function loadJSON(products){
				bindList(products);
			};

			function getMethod(){
				var loadData;

				function loadAX(){
					var url = settings.products_load_url;
					var start = 1;
					var end = settings.url_load_page_count;

					loadAJAX(url, start, end );
				};

				function loadJS(){
					var products = settings.products_load_json;
					loadJSON(products);
				};

				if(settings.products_load_url != null){
					loadData = loadAX;					
				}
				else{
					loadData = loadJS;
				}

				return loadData;
			};			

			return getMethod();
		};

		var Paypal = function(getDataFunc){
			function paypalForm(){
				var dataFields = [];

				function getFormObj(){
					var form = $('<form>', {
						'action': 'https://www.paypal.com/cgi-bin/webscr',
						'method': 'post',
						'id': 'paypalForm',
						'target': '_blank',
						'hidden': 'hidden'
					});

					return form;
				};

				function checkIfExists(){
					var frm = $(document).find('#paypalForm');
					return frm.length != 0 ? frm : null;
				};

				function setDefaultFields(form){
					var business = settings.paypal.business;
					var currencyCode = settings.paypal.currency_code;
					var lc = settings.paypal.lc;
					var image_url = settings.paypal.image_url;
					var type = 'hidden';
					var names = ['cmd', 'upload', 'business', 'currency_code', 'lc', 'image_url'];
					var values = ['_cart', '1', business, currencyCode, lc, image_url];

					for(var i = 0; i < names.length; ++i){
						var input = $('<input>', { 'name': names[i], 'value': values[i] });
						form.append(input);
					}
				};

				function bindData(form){
					var data = getDataFunc();

					for(var i = 0; i < data.length; ++i){
						var newI = i+1;

						var name = $('<input>', { type: 'hidden', 'name': "item_name_"+newI});
						var price = $('<input>', { type: 'hidden', 'name': "amount_"+newI});
						var quantity = $('<input>', { type: 'hidden', 'name': "quantity_"+newI});
						var sku = $('<input>', { type: 'hidden', 'name': "item_number_"+newI});
						
						name.val(data[i].name);
						price.val(data[i].unitPrice);
						quantity.val(data[i].quantity);
						sku.val(data[i].sku);

						dataFields.push(name, price, quantity, sku);
						form.append(name, price, quantity, sku);
					}
				};

				function appendToBody(form){
					form.appendTo(document.body);
				};

				function submit(form){
					form.submit();
				};

				function clearData(frm){
					while(dataFields.length){
						var dataInput = dataFields[dataFields.length-1];
						dataInput.remove();
						dataFields.pop();
					};
				};

				this.create = function(){
					var frm = checkIfExists();
					// form not found - declare a new one
					if(frm == null){
						frm = getFormObj();
						setDefaultFields(frm);
						appendToBody(frm);
					};
					
					clearData(frm);
					bindData(frm);
					submit(frm);
				};
			};

			function bindCheckOutButton(func){
				var checkoutToPaypalBtn = $('#checkoutToPaypalBtn');
				checkoutToPaypalBtn.on('click', func);
			};

			return {
				'enable': function(){
					var form = new paypalForm();
					bindCheckOutButton(form.create);
				}
			};
		};

		var methods = (function init(){
			function initCategory(){
				var cat = Category(category, settings.catTitle);
				return cat;
			};

			function initProductsContainer(category){
				return category.getProductsContainer();
			};

			function initProductsList(productsContainer){
				var cart = Cart(cartContainer);
				return ProductsList(productsContainer, cart);
			};

			function initPaypal(){
				var cart = Cart(cartContainer);
				var paypal = Paypal( cart.getData );
				paypal.enable();
			};

			var loadData = (function initAll(){
				var cat = initCategory();
				var prodsContainer = initProductsContainer(cat);
				initPaypal();

				return initProductsList(prodsContainer);
			}());
			
			return {
				'loadData': loadData
			};
		}());

		this.loadData = methods.loadData;
	};

	function shopcart(cartContainer, options){
        var cartCntr = $(cartContainer);
		var category = $(this);
		var settings = (function getSettings(curOptions){
			var defaultOptions = {
				'catTitle': 'default title',
				'add_to_cart_image_url': 'images/cart.png',
				'products_load_json': null,
				'products_load_url': null,
				'url_load_page_count': 0,
				'paypal': {
					'currency_code': 'USD',
					'lc': 'en_US',
					'business': 'm.dofo123@gmail.com',
					'image_url': null,
					'return': null,
					'cancel_return': null
				}
			};

			curOptions.paypal = $.extend(defaultOptions.paypal, curOptions.paypal);
			return $.extend(defaultOptions, curOptions);
		}(options));

		var shop = new Shop (
			category, cartCntr,settings
		);

		shop.loadData();
	};
	// plugin definition
	$.fn.shopcart = shopcart;
});