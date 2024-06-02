function addToCart(proID) {
    $.ajax({
        url: '/add-to-cart/' + proID,
        method: 'get',
        success: (response) => {
            if(response.status){
                let count=$('#cart-count').html()
                count = parseInt(count)+1 // for converting string to integer and iterate
                $("#cart-count").html(count) 
            }

        }
    })
}