package worker

import (
	"fmt"
	"github.com/robfig/cron/v3"
	"github.com/thecloudmasters/uesio/pkg/invoices"
	"github.com/thecloudmasters/uesio/pkg/logger"
	"github.com/thecloudmasters/uesio/pkg/usage/usage_worker"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"
)

var jobs []Job

// Register all jobs that should be performed
func init() {
	jobs = append(jobs, NewJob("Invoices", "@daily", invoices.InvoicingJob))
	jobs = append(jobs, NewJob("Usage", getUsageCronSchedule(), usage_worker.UsageWorker))
}

// Allows for usage job frequency to be overridden by environment variables. defaults to every 10 minutes,
// but can be as frequent as every 1 minute
func getUsageCronSchedule() string {
	usageJobRecurrenceMinutes := os.Getenv("UESIO_USAGE_JOB_RECURRENCE_MINUTES")
	if usageJobRecurrenceMinutes == "" {
		usageJobRecurrenceMinutes = "10"
	}
	intVal, err := strconv.Atoi(usageJobRecurrenceMinutes)
	if err != nil || intVal < 1 || intVal > 30 {
		logger.Log("UESIO_USAGE_JOB_RECURRENCE_MINUTES must be an integer in the range [1, 30]", logger.ERROR)
		os.Exit(1)
	}
	return fmt.Sprintf("*/%d * * * *", intVal)
}

// ScheduleJobs schedules all configured Uesio worker jobs, such as usage event aggregation, to be run on a schedule
func ScheduleJobs() {

	s := cron.New(cron.WithLocation(time.UTC))

	var jobEntries = make([]cron.EntryID, len(jobs), len(jobs))

	// Load all jobs
	for i, job := range jobs {
		schedule := job.Schedule()
		logger.Info("Scheduling job " + job.Name() + " with schedule: " + schedule)
		entryId, err := s.AddFunc(job.Schedule(), wrapJob(job))
		if err != nil {
			logger.Log(fmt.Sprintf("Failed to schedule job %s, reason: %s", job.Name(), err.Error()), logger.ERROR)
		} else {
			jobEntries[i] = entryId
		}

	}
	logger.Info("Finished loading all jobs, starting scheduler now...")

	// (Helpful for local development to see when jobs will next be run...)
	//go func() {
	//	time.Sleep(time.Second * 2)
	//	for {
	//		for i, entryID := range jobEntries {
	//			logger.Info(fmt.Sprintf("Cron job %s (%d) next run will be at: %s", jobs[i].Name(), entryID, s.Entry(entryID).Next.Format(time.Stamp)))
	//		}
	//		time.Sleep(time.Minute)
	//	}
	//}()

	s.Start()

	// Block until process is terminated
	done := make(chan os.Signal, 1)
	signal.Notify(done, syscall.SIGINT, syscall.SIGTERM)
	<-done // Will block here until process is terminated
	logger.Info("Received SIGTERM, stopping job scheduler with 5 second grace period...")
	s.Stop()
	time.Sleep(5 * time.Second)
	logger.Info("Process completed")
}

// wraps a Job so that we can perform logging and other utility work,
// and so that the loop properly captures the closure scope
func wrapJob(job Job) func() {
	return func() {
		jobErr := job.Run()
		if jobErr != nil {
			logger.Log(fmt.Sprintf("%s job failed reason: %s", job.Name(), jobErr.Error()), logger.ERROR)
		}
	}
}