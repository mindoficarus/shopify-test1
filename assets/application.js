// Put your applicaiton javascript here
$(document).ready(function() {

  let
    onQuantityButtonClick = function(event) {

      let $button = $(this),
          targetSelector = $button.data('target'),
          $quantityField = $(targetSelector),
          currentQuantity = parseInt($quantityField.val(), 10),
          max = $quantityField.attr('max') ? parseInt($quantityField.attr('max'), 10) : null;

      if ($button.hasClass('plus') && (max === null || currentQuantity < max)) {
        $quantityField.val(currentQuantity + 1).change();
      } else if ($button.hasClass('minus') && currentQuantity > 1) {
        $quantityField.val(currentQuantity - 1).change();
      }
    },
    onQuantityFieldChange = function(event) {
      let $field = $(this),
          itemId = $field.data('item-id'), // Assuming each quantity field has a data attribute with the item ID
          newQuantity = parseInt($field.val(), 10),
          $quantityText = $('#QuantityText-' + itemId),
          $cartItemCount = $('.js-cart-item-count'); // The selector for the cart item count in the UI

      $quantityText.text(newQuantity);

      // Trigger an AJAX call to update the server-side cart
      $.ajax({
        type: 'POST',
        url: '/cart/update.js', // The URL for the cart update endpoint
        data: {
          id: itemId, // The unique identifier for the cart item
          quantity: newQuantity // The new quantity
        },
        dataType: 'json',
        success: function(response) {
          // Assuming the response contains the updated cart item count
          $cartItemCount.text(response.item_count);
          // You can also update other parts of the UI as necessary here
        },
        error: function(XMLHttpRequest, textStatus) {
          // Handle errors (e.g., item stock issues, server errors)
          alert('Error updating cart. Please try again.');
        }
      });

      if (shouldDisableMinus) {
        $minusButton.prop('disabled', true);
      }
      else if ($minusButton.prop('disabled') === true) {
        $minusButton.prop('disabled', false);
      }

      if (shouldDisablePlus) {
        $plusButton.prop('disabled', true);
      }
      else if ($plusButton.prop('disabled') === true) {
        $plusButton.prop('disabled', false);
      }
    },
    onVariantRadioChange = function(event) {
      let
        $radio = $(this),
        $form = $radio.closest('form'),
        max = $radio.attr('data-inventory-quantity'),
        $quantity = $form.find('.js-quantity-field'),
        $addToCartButton = $form.find('#add-to-cart-button');

      if ($addToCartButton.prop('disabled') === true) {
        $addToCartButton.prop('disabled', false);
      }

      $quantity.attr('max', max);

      if (parseInt($quantity.val()) > max) {
        $quantity.val(max).change();
      }
    },
    onAddToCart = function(event) {
      event.preventDefault();

      $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: $(this).serialize(),
        dataType: 'json',
        success: onCartUpdated,
        error: onError
      });
    },
    onLineRemoved = function(event) {
      event.preventDefault();

      let
        $removeLink = $(this),
        removeQuery = $removeLink.attr('href').split('change?')[1];
      $.post('/cart/change.js', removeQuery, onCartUpdated, 'json');
    },
    onCartUpdated = function() {
      $.ajax({
        type: 'GET',
        url: '/cart',
        context: document.body,
        success: function(context) {
          let
            $dataCartContents = $(context).find('.js-cart-page-contents'),
            dataCartHtml = $dataCartContents.html(),
            dataCartItemCount = $dataCartContents.attr('data-cart-item-count'),
            $miniCartContents = $('.js-mini-cart-contents'),
            $cartItemCount = $('.js-cart-item-count');

          $cartItemCount.text(dataCartItemCount);
          $miniCartContents.html(dataCartHtml);

          if (parseInt(dataCartItemCount) > 0) {
            openCart();
          }
          else {
            closeCart();
          }
        }
      });
    },
    onError = function(XMLHttpRequest, textStatus) {
      let data = XMLHttpRequest.responseJSON;
      alert(data.status + ' - ' + data.message + ': ' + data.description);
    },
    openCart = function() {
      $('html').addClass('mini-cart-open');
    },
    closeCart = function() {
      $('html').removeClass('mini-cart-open');
    },
    onCartButtonClick = function(event) {
      event.preventDefault();

      let isCartOpen = $('html').hasClass('mini-cart-open');

      if (!isCartOpen) {
        openCart();
      }
      else {
        closeCart();
      }
    };

  $(document).on('click', '.js-quantity-button', onQuantityButtonClick);
  $(document).on('change', '.js-quantity-field', onQuantityFieldChange);

  $(document).on('change', '.js-variant-radio', onVariantRadioChange);

  $(document).on('submit', '#AddToCartForm', onAddToCart);

  $(document).on('click', '#mini-cart .js-remove-line', onLineRemoved);

  $(document).on('click', '.js-cart-link, #mini-cart .js-keep-shopping, .js-close-button', onCartButtonClick);

});
