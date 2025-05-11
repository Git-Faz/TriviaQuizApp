const QuizStats = ({ csStats, gkStats, moviesStats, psychStats }) => {
  const defaultStats = { attempts: 0, highScore: 0, average: 0 };
  const stats = {
    cs: csStats || defaultStats,
    gk: gkStats || defaultStats,
    movies: moviesStats || defaultStats,
    psych: psychStats || defaultStats
  };

  const formatAverage = (avg) => {
    const num = Number(avg);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div className="quiz-stats flex flex-col justify-around w-fit h-fit mt-4 p-4 bg-[#3bc7ff] text-black rounded-lg font-bold">
      <h3 className="mb-2 text-2xl">Quiz Stats</h3>
      <table className="w-fit h-fit mt-4 border-collapse text-black rounded-md">
        <thead>
          <tr>
            <th className="border-2 border-black bg-black text-white p-2">Category</th>
            <th className="border-2 border-black bg-black text-white p-2">Attempts</th>
            <th className="border-2 border-black bg-black text-white p-2">High Score (20)</th>
            <th className="border-2 border-black bg-black text-white p-2">Average</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-2 border-black p-2">Computer Science</td>
            <td className="border-2 border-black p-2">{stats.cs.attempts}</td>
            <td className="border-2 border-black p-2">{stats.cs.highScore}</td>
            <td className="border-2 border-black p-2">{formatAverage(stats.cs.average)}</td>
          </tr>
          <tr>
            <td className="border-2 border-black p-2">General Knowledge</td>
            <td className="border-2 border-black p-2">{stats.gk.attempts}</td>
            <td className="border-2 border-black p-2">{stats.gk.highScore}</td>
            <td className="border-2 border-black p-2">{formatAverage(stats.gk.average)}</td>
          </tr>
          <tr>
            <td className="border-2 border-black p-2">Movies</td>
            <td className="border-2 border-black p-2">{stats.movies.attempts}</td>
            <td className="border-2 border-black p-2">{stats.movies.highScore}</td>
            <td className="border-2 border-black p-2">{formatAverage(stats.movies.average)}</td>
          </tr>
          <tr>
            <td className="border-2 border-black p-2">Psychology</td>
            <td className="border-2 border-black p-2">{stats.psych.attempts}</td>
            <td className="border-2 border-black p-2">{stats.psych.highScore}</td>
            <td className="border-2 border-black p-2">{formatAverage(stats.psych.average)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default QuizStats;