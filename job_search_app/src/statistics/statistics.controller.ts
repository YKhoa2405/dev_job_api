// src/statistics/statistics.controller.ts
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";
import { Public } from "src/common/decorator/customize";
import { ServiceGuard } from "./ServiceGuard";

@Public()
@Controller("statistics")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) { }

  @UseGuards(ServiceGuard)
  @Get("applications-per-job")
  async getApplicationsPerJob(@Query() qr: string) {
    return this.statisticsService.getApplicationsPerJob(qr);
  }

  @UseGuards(ServiceGuard)
  @Get("application-status")
  async getApplicationStatus(@Query() query: string) {
    return this.statisticsService.getApplicationStatus(query);
  }

  @UseGuards(ServiceGuard)
  @Get("candidate-skills")
  async getCandidateSkills(@Query() qr: string) {
    return this.statisticsService.getCandidateSkills(qr);
  }

  @UseGuards(ServiceGuard)
  @Get("expected-salary")
  async getExpectedSalary(@Query() query: string) {

    return this.statisticsService.getExpectedSalary(query);
  }

}