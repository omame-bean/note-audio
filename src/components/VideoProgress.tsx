import React, { useEffect } from 'react';

interface ProgressStep {
  step: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'error';
}

interface VideoProgressProps {
  progressSteps: ProgressStep[];
  videoProgress: string | null;
}

const VideoProgress: React.FC<VideoProgressProps> = ({ progressSteps, videoProgress }) => {
  useEffect(() => {
    console.log('VideoProgress 渡された progressSteps:', progressSteps);
    console.log('VideoProgress 渡された videoProgress:', videoProgress);
  }, [progressSteps, videoProgress]);

  return (
    <div className="p-4 bg-gray-100 border-t">
      <h3 className="text-lg font-semibold mb-2">動画生成の進捗状況</h3>
      <ul className="space-y-2">
        {progressSteps.map((step) => (
          <li key={step.step} className="flex items-center">
            <span
              className={`w-4 h-4 rounded-full mr-2 ${
                step.status === 'completed' ? 'bg-green-500' :
                step.status === 'in-progress' ? 'bg-yellow-500' :
                step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
              }`}
            ></span>
            <span
              className={`${
                step.status === 'completed' ? 'text-green-700' :
                step.status === 'in-progress' ? 'text-yellow-700' :
                step.status === 'error' ? 'text-red-700' : 'text-gray-700'
              }`}
            >
              {step.step}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-blue-800">{videoProgress}</p>
    </div>
  );
}

export default VideoProgress;
