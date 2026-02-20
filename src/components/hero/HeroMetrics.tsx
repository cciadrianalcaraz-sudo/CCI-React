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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 mt-8 lg:mt-0">
            <Metric title="360°" text="Visión integral fiscal y financiera" />
            <Metric title="Claridad" text="Reportes fáciles de entender" />
            <Metric title="Control" text="Procesos robustos y definidos" />
        </div>
    );
}

