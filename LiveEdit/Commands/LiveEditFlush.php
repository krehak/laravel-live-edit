<?php

namespace Krehak\LiveEdit\Commands;

use Krehak\LiveEdit\Helpers\LiveEdit;
use Illuminate\Console\Command;

class LiveEditFlush extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'live-edit:flush';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Flushes cache for Live Edit';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle()
    {
        LiveEdit::flushCache();

        $this->info('Cache flushed successfully');
    }
}
