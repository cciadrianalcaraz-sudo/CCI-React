import React from 'react';

interface MetricProps {
    title: string;
    text: string;
}

const Metric: React.FC<MetricProps> = ({ title, text }) => (
    <div>
        <h3 className="font-bold">{title}</h3>
        <p className="text-neutral-600 text-sm">{text}</p>
    </div>
);

export default function HeroMetrics() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Metric title="360°" text="Visión integral fiscal y financiera" />
            <Metric title="Mejor decisión" text="Reportes claros" />
            <Metric title="Más control" text="Procesos definidos" />
        </div>
    );
}
