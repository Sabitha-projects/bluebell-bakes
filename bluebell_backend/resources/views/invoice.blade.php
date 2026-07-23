<!DOCTYPE html>
<html>

<head>

    <title>Invoice</title>

    <style>

        body {
            font-family: Arial;
            padding: 30px;
        }

        h1 {
            color: #e91e63;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        table,
        th,
        td {
            border: 1px solid #ccc;
        }

        th,
        td {
            padding: 12px;
            text-align: left;
        }

        .total {
            text-align: right;
            margin-top: 20px;
            font-size: 24px;
            font-weight: bold;
            color: green;
        }

    </style>

</head>

<body>

    <h1>Blue Bell Bakes 🎂</h1>

    <h2>Invoice #{{ $order->id }}</h2>

    <p>
        Customer:
        {{ $order->customer_name }}
    </p>

    <p>
        Date:
        {{ $order->created_at }}
    </p>

    <table>

        <thead>

            <tr>

                <th>Product</th>

                <th>Quantity</th>

                <th>Price</th>

                <th>Total</th>

            </tr>

        </thead>

        <tbody>

            @foreach($order->items as $item)

                <tr>

                    <td>
                        {{ $item->product->name }}
                    </td>

                    <td>
                        {{ $item->quantity }}
                    </td>

                    <td>
                        ₹ {{ $item->price }}
                    </td>

                    <td>
                        ₹ {{ $item->price * $item->quantity }}
                    </td>

                </tr>

            @endforeach

        </tbody>

    </table>

    <div class="total">

        Grand Total:
        ₹ {{ $order->total_price }}

    </div>

</body>

</html>