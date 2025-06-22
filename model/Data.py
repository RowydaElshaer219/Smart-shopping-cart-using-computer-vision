from supabase import create_client, Client

# Initialize Supabase client
url: str = "Add supabase URL"
key: str = "Add supabase Key"
supabase: Client = create_client(url, key)


def manage_cart(action, cart_id, product_name, quantity=1):

    try:
        # Fetch product ID by name
        response = supabase.table("product").select("productid").eq("name", product_name).execute()

        if not response.data:
            return {"error": f"Product '{product_name}' not found in the 'product' table."}

        productid = response.data[0]['productid']

        # Check if the product exists in the cart
        cart_response = supabase.table("cartproduct").select("quantity").eq("cartid", cart_id).eq("productid", productid).execute()

        if action == 'add':
            if cart_response.data:
                # Update quantity if the product already exists
                new_quantity = cart_response.data[0]["quantity"] + quantity
                update_response = supabase.table("cartproduct").update({"quantity": new_quantity}).eq("cartid", cart_id).eq("productid", productid).execute()
                return {"message": f"Product quantity updated to {new_quantity}.", "response": update_response}
            else:
                # Add new product to the cart
                insert_response = supabase.table("cartproduct").insert({"cartid": cart_id, "productid": productid, "quantity": quantity}).execute()
                return {"message": f"Product added to cart with quantity {quantity}.", "response": insert_response}

        elif action == 'update':
            if cart_response.data:
                # Update the product quantity
                update_response = supabase.table("cartproduct").update({"quantity": quantity}).eq("cartid", cart_id).eq("productid", productid).execute()
                return {"message": f"Product quantity updated to {quantity}.", "response": update_response}
            else:
                return {"error": f"Product not found in cart {cart_id}."}

        elif action == 'delete':
            if cart_response.data:
                # Remove the product from the cart
                delete_response = supabase.table("cartproduct").delete().eq("cartid", cart_id).eq("productid", productid).execute()
                return {"message": f"Product removed from cart {cart_id}.", "response": delete_response}
            else:
                return {"error": f"Product not found in cart {cart_id}."}

        else:
            return {"error": "Invalid action. Please use 'add', 'update', or 'delete'."}

    except Exception as e:
        return {"error": str(e)}
    
    
if __name__ == "__main__":
        action = "add"  # 'add', 'update', or 'delete'
        cart_id = 1
        product_name = "Hohos"
        # quantity = 2  # Used only for 'add' or 'update'

        result = manage_cart(action, cart_id, product_name)
        print(result)