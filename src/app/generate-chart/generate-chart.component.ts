import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild,Input,HostListener } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-generate-chart',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './generate-chart.component.html',
  styleUrl: './generate-chart.component.css'
})
export class GenerateChartComponent implements AfterViewInit {

  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;
  @Input() title: string = 'titulo';
  @Input() chartData:any =
  {
    labels: ['Debt A', 'Debt B', 'Debt C', 'Totales'],
    datasets: [
      {
        label: 'Deuda Actual',
        data: [5000, 7000, 10000, 10000],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'Stack 0'
      },
      {
        label: 'Intereses Actual',
        data: [1500, 3400, 3000, 1200],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        stack: 'Stack 0'
      },
      {
        label: 'Deuda Actual',
        data: [5000, 7000, 10000, 10000],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'Stack 1'
      },
      {
        label: 'Intereses Beneficiar',
        data: [1500, 3400, 3000, 1200],
        backgroundColor: 'rgba(205, 0, 200, 0.6)',
        borderColor: 'rgba(205, 0, 200, 1)',
        borderWidth: 1,
        stack: 'Stack 1'
      },
      {
        label: 'Diferencia Total',
        data: [0],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        stack: 'Stack 2',
      }
    ]
  };

  chart!: Chart;

  // Update dataset dynamically
  updateDataSet(data: any) {
    this.chart.data=data;
    this.chart.update();
  }

  ngAfterViewInit() {
    this.createBarChart();
  }

  createBarChart() {
    const canvas = this.barChartCanvas.nativeElement as HTMLCanvasElement;
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: this.chartData,
      options:{responsive:true,onResize(chart, size) {
        
      },}
    });
  }
  width: number = window.innerWidth;
  height: number = window.innerHeight;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  
}


