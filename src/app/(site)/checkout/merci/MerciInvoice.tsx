'use client';
import React, { useRef } from 'react';

type Props = {
    data: any;
};

// Fonction pour formater les prix en Ariary avec séparateurs de milliers
const formatAriary = (value: number | string) => {
    const num = Number(value) || 0;
    return num.toLocaleString('fr-FR') + ' Ar';
};

// Traduction du statut
const translateStatus = (status: string) => {
    switch (status) {
        case 'on-hold':
            return 'En attente de paiement';
        case 'pending':
            return 'En attente';
        case 'processing':
            return 'En cours de traitement';
        case 'completed':
            return 'Terminée';
        case 'cancelled':
            return 'Annulée';
        case 'failed':
            return 'Échouée';
        default:
            return status;
    }
};

export default function MerciInvoice({ data }: Props) {
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!invoiceRef.current) return;

        const printWindow = window.open('', '', 'width=800,height=600');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>Facture #${data.order_number ?? data.order_id}</title>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; padding: 20px; background: #fff; text-align: center; }
                    h2 { margin-bottom: 16px; color: #e94e1a; }
                    p { margin: 4px 0; }
                    table { width: 80%; margin: 0 auto; border-collapse: collapse; margin-top: 16px; }
                    th, td { border-bottom: 1px solid #ccc; padding: 10px; text-align: center; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    tfoot td { font-weight: bold; border-top: 2px solid #e94e1a; }
                    .footer { margin-top: 24px; border-top: 1px solid #ccc; padding-top: 12px; text-align: center; }
                    .note { color: #585656ff; margin-top: 12px; font-style: italic; }
                </style>
            </head>
            <body>
                ${invoiceRef.current.innerHTML}
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
                ref={invoiceRef}
                style={{
                    marginTop: 16,
                    padding: 24,
                    border: '1px solid #eee',
                    borderRadius: 8,
                    fontFamily: 'Arial, sans-serif',
                    color: '#333',
                    background: '#fff',
                    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                    width: '90%',
                    maxWidth: 800
                }}
            >
                <h2>Facture</h2>

                <p><strong>Numéro de commande:</strong> {data.order_number ?? data.order_id}</p>
                <p><strong>Statut:</strong> {translateStatus(data.status)}</p>
                <p><strong>Méthode de paiement:</strong> {data.method}{data.method_title ? ` — ${data.method_title}` : ''}</p>

                <table>
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Quantité</th>
                            <th>Prix unitaire</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.lines && data.lines.length > 0 ? (
                            data.lines.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatAriary(item.price)}</td>
                                    <td>{formatAriary(item.total)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: 10 }}>Aucun produit trouvé</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3}>Total</td>
                            <td>{formatAriary(data.total)}</td>
                        </tr>
                    </tfoot>
                </table>

                {data.note && <p className="note">Note: {data.note}</p>}

                <div className="footer">
                    <img src="/logo-ballou.png" alt="Ballou" style={{ maxHeight: 50, marginBottom: 8 }} />
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Ballou — Votre satisfaction, notre priorité</p>
                </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <a href="/" className="inline-flex items-center rounded bg-[#e94e1a] px-4 py-2 text-white">
                    Continuer mes achats
                </a>
                <button
                    onClick={handlePrint}
                    className="inline-flex items-center rounded border px-4 py-2 hover:bg-gray-100 transition"
                >
                    Imprimer le reçu
                </button>
            </div>
        </div>
    );
}