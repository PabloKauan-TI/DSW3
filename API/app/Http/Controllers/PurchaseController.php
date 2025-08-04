<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\Product;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function index()
    {
        return response()->json(Purchase::with(['user', 'product'])->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'    => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $product = Product::find($validated['product_id']);

        if ($product->quantity < $validated['quantity']) {
            return response()->json(['message' => 'Estoque insuficiente'], 400);
        }

        $price = $product->price;
        $quantity = $validated['quantity'];
        $total = $price * $quantity;

        $purchase = Purchase::create([
            'user_id'    => $validated['user_id'],
            'product_id' => $validated['product_id'],
            'quantity'   => $quantity,
            'price'      => $price,
            'total'      => $total,
        ]);

        $product->decrement('quantity', $quantity);

        return response()->json($purchase->load(['user', 'product']), 201);
    }

    public function show($id)
    {
        $purchase = Purchase::with(['user', 'product'])->find($id);

        if (!$purchase)
            return response()->json(['message' => 'Compra não encontrada'], 404);

        return response()->json($purchase, 200);
    }

    public function destroy($id)
    {
        $purchase = Purchase::find($id);

        if (!$purchase)
            return response()->json(['message' => 'Compra não encontrada'], 404);

        $purchase->delete();

        return response()->json(['message' => 'Compra removida com sucesso'], 200);
    }
}
