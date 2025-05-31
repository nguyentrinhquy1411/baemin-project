import Image from "next/image";

interface CartItem {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    img: string;
    stall_id: string;
    stall_name: string;
}

export default function DetailsCheckout({ items }: { items: CartItem[] }) {
    
    return (
        <>
            <div className="mt-3 ml-10 grid grid-cols-12">
                <div className="col-span-6">Món Ăn</div>
                <div className="col-span-2">Đơn giá</div>
                <div className="col-span-2">Số Lượng</div>
                <div className="col-span-2">Thành tiền</div>
            </div>
       
            {items.map((item, index) => (
                <div key={item.id || index} className="mt-4 ml-10 grid grid-cols-12">
                    <div className="col-span-6 flex flex-row items-center gap-3">
                        <div className="w-16 h-16 relative"> 
                            <Image 
                                fill 
                                className="object-cover" 
                                src={item.img} 
                                alt={item.name}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-base">{item.name}</span>
                            <span className="text-sm text-gray-600">{item.description}</span>
                            <span className="text-xs text-gray-500">Cửa hàng: {item.stall_name}</span>
                        </div>
                    </div>
                    <div className="col-span-2 ml-1 flex items-center">₫{item.price.toLocaleString()}</div>
                    <div className="col-span-2 ml-5 flex items-center">{item.quantity}</div>
                    <div className="col-span-2 ml-5 flex items-center">₫{(item.price * item.quantity).toLocaleString()}</div>
                </div>
            ))}
        </>
    )
}
