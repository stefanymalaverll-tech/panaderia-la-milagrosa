'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toJpeg } from 'html-to-image';

export function useCierre() {
  const router = useRouter();
  const { id } = useParams();
  
  const [cargando, setCargando] = useState(true);
  const [desglosePagos, setDesglosePagos] = useState([]);
  const [montosContados, setMontosContados] = useState({});
  const [totalOrdenes, setTotalOrdenes] = useState(0); 
  const [procesando, setProcesando] = useState(false);
  const [cierreCaja, setCierreCaja] = useState(false);
  const [generandoImagen, setGenerandoImagen] = useState(false);
  
  const ticketRef = useRef(null);
  const [notificacion, setNotificacion] = useState({ show: false, mensaje: '', tipo: '' });
  const timerNotificacion = useRef(null);

  const mostrarMensaje = (mensaje, tipo = 'error') => {
    setNotificacion({ show: true, mensaje, tipo });
    if (timerNotificacion.current) clearTimeout(timerNotificacion.current);
    timerNotificacion.current = setTimeout(() => {
      setNotificacion(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    const cargarDatosCierre = async () => {
      if (!id) return;

      try {
        const idCajaNum = parseInt(id, 10);

        const { data: resTotales, error: errorTotales } = await supabase.rpc('calcular_totales_cierre', {
          p_id_caja: idCajaNum 
        });
        if (errorTotales) throw errorTotales;
        setDesglosePagos(resTotales || []); 

        const { count, error: errorOrdenes } = await supabase
          .from('orden')
          .select('*', { count: 'exact', head: true })
          .eq('id_caja', idCajaNum);

        if (errorOrdenes) throw errorOrdenes;
        setTotalOrdenes(count || 0);

      } catch (error) {
        mostrarMensaje("❌ Hubo un error cargando la información de la caja.", 'error');
      } finally {
        setCargando(false);
      }
    };

    cargarDatosCierre();
  }, [id]);

  const handleCambioContado = (id_pago, valor) => {
    setMontosContados(prev => ({ 
      ...prev, 
      [id_pago]: parseFloat(valor) || 0 
    }));
  };

  const obtenerIconoPago = (nombre, moneda) => {
    const n = nombre.toLowerCase();
    if (n.includes('dólar') || n.includes('dolar') || moneda === 'USD') return '💵';
    if (n.includes('punto') || n.includes('tarjeta')) return '💳';
    if (n.includes('movil') || n.includes('móvil')) return '📱';
    if (n.includes('efectivo')) return '🪙';
    return '💰';
  };

  const calcularTotalesFinancieros = () => {
    let subtotalBs = 0;
    let subtotalUsd = 0;

    desglosePagos.forEach(item => {
      const contado = montosContados[item.id_pago] || 0;
      if (item.moneda === 'Bs') {
        subtotalBs += contado;
      } else if (item.moneda === 'USD') {
        subtotalUsd += contado;
      }
    });

    return { subtotalBs, subtotalUsd };
  };

  const { subtotalBs, subtotalUsd } = calcularTotalesFinancieros();

  const procesarArqueoCierre = async () => {
    setCierreCaja(false);
    setProcesando(true);

    try {
      const idCajaNum = parseInt(id, 10);

      const detallesInsercion = desglosePagos.map(item => {
        const contado = montosContados[item.id_pago] || 0;
        const esperado = Number(item.monto_esperado) || 0;
        return {
          id_caja: idCajaNum,
          id_pago: item.id_pago,
          monto_esperado: esperado,
          monto_contado: contado,
          diferencia: contado - esperado
        };
      });

      const { error: errorDetalles } = await supabase
        .from('detalle_cierre_caja')
        .insert(detallesInsercion);
        
      if (errorDetalles) throw errorDetalles;

      const { error: errorCaja } = await supabase
        .from('caja')
        .update({ 
          status: 'Cerrado', 
          hora_cierre: new Date().toISOString() 
        })
        .eq('id_caja', idCajaNum);

      if (errorCaja) throw errorCaja;

      mostrarMensaje('✅ Caja cerrada exitosamente. Generando Comprobante...', 'success');
      
      setGenerandoImagen(true);
      await new Promise(resolve => setTimeout(resolve, 100));

      if (ticketRef.current) {
        const dataUrl = await toJpeg(ticketRef.current, { 
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        });
        
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `ComprobanteCierre_Caja${id}.jpg`;
        link.click();
      }
      
      await supabase.auth.signOut();
      router.push('/');
      
    } catch (error) {
      mostrarMensaje(`Error cerrando caja. Intente nuevamente.`, 'error');
      setGenerandoImagen(false);
    } finally {
      setProcesando(false);
    }
  };

  return {
    id,
    cargando,
    desglosePagos,
    montosContados,
    totalOrdenes,
    procesando,
    cierreCaja,
    setCierreCaja,
    generandoImagen,
    ticketRef,
    notificacion,
    handleCambioContado,
    obtenerIconoPago,
    subtotalBs,
    subtotalUsd,
    procesarArqueoCierre
  };
}