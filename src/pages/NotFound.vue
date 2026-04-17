
<template>
  <div class="not-found-container">
    <div class="content-wrapper">
      <!-- 错误码展示 -->
      <div class="error-code animate-pulse">404</div>
      
      <!-- 错误标题 -->
      <h1 class="error-title">頁面未找到</h1>
      
      <!-- 错误描述 -->
      <p class="error-description">
        抱歉，您訪問的頁面不存在，請聯繫系統管理員處理此問題。
      </p>
      


    </div>
  </div>
</template>

<script>

</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Nunito', sans-serif;
}

.content-wrapper {
  text-align: center;
  max-width: 800px;
  width: 90%;
  color: #333;
}

.error-code {
  font-size: 10rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.error-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.search-container {
  position: relative;
  max-width: 400px;
  margin: 2rem auto;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #764ba2;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  outline: none;
  transition: all 0.3s ease;
  position: relative;
}

.search-input:focus {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.suggestions {
  margin-top: 3rem;
  color: rgba(255, 255, 255, 0.8);
}

.suggestions-title {
  margin-bottom: 1rem;
  font-weight: 600;
  color: white;
}

.suggestion-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.suggestion-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.suggestion-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* 动画关键帧 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }
}
</style>
