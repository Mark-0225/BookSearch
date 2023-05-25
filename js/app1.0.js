// 當鼠標點擊到搜索欄時虛化背景
window.onload = function () {
  var searchBtn = document.querySelector(".search-btn")
  var style1 = document.createElement("style")
  var searchBox = document.querySelector(".search-box")
  var timeBox = document.querySelector(".timeBox")
  searchBtn.addEventListener("focus", function () {
    style1.innerHTML = ".weather-widget,.user-btn,.favorites-btn,.timeBox,.switch,.background-container,.social-icons,.login-container,#Cnlogo,p,#LOgo,body::before{ filter: blur(15px); transform: scale(1.01);}"
    document.head.appendChild(style1)
    searchBox.style.width = "250px"
  })
  searchBtn.addEventListener("blur", function () {
    document.head.removeChild(style1)
    searchBox.style.width = ""
  })

  // 显示时间
  setInterval(function () {
    var date = new Date()
    let hh = padZero(date.getHours())
    let mm = padZero(date.getMinutes())
    let ss = padZero(date.getSeconds())
    timeBox.innerText = hh + ":" + mm + ":" + ss
  }, 1000);

  // 补零函数，当显示个位数时候前面加个零
  function padZero(n) {
    return n > 9 ? n : "0" + n
  }
}

// 使用ggbooks API進行書記搜索并且顯示結果
$(document).ready(function () {
  $("#searchBtn").on("click", function () {
    const query = $("#searchInput").val()
    const filterType = $("#filterDropdown").val()
    searchBooks(query, filterType)
  })
})

function searchBooks(query, filterType, startIndex = 0, maxResults = 40) {
  const apiKey = "AIzaSyBwSzvgc0XxoLQ9ocDFeTQ-ThI0HuweDdU"
  const filterQuery = filterType ? `${filterType}:${query}` : query
  const url = `https://www.googleapis.com/books/v1/volumes?q=${filterQuery}&startIndex=${startIndex}&maxResults=${maxResults}&key=${apiKey}`

  $.ajax({
    url: url,
    type: "GET",
    dataType: "json",
    success: function (data) {
      displayResults(data.items)
    },
    error: function (error) {
      console.log("Error:", error)
      alert("Error")
    },
  })
}


//獲取isbn國際標準書號
function formatData(data) {
  return data ? data.join(", ") : "未知"
}

// 使用常數提取書籍信息
function createBookItem(book, volumeInfo) {
  const title = volumeInfo.title
  const authors = formatData(volumeInfo.authors)
  const cover = volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/128x192.png?text=封面暂无"
  const rating = volumeInfo.averageRating || "暂无评分"
  const previewLink = volumeInfo.previewLink
  const publisher = volumeInfo.publisher || "未知"
  const publishedDate = volumeInfo.publishedDate || "未知"
  const pageCount = volumeInfo.pageCount || "未知"
  const isbn = formatData(volumeInfo.industryIdentifiers?.map((id) => id.identifier))
  const categories = formatData(volumeInfo.categories)

  // 星星样式
  function renderStars(rating) {
    let stars = ""
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<i class="fas fa-star"></i>'
      } else {
        stars += '<i class="far fa-star"></i>'
      }
    }
    return stars
  }
  const starRating = renderStars(rating)

  // 收藏愛心樣示
const favorites = JSON.parse(localStorage.getItem("favorites")) || []
const isFavorite = favorites.includes(book.id)
const favoriteIconClass = isFavorite ? "fav" : "fan"
const favoriteButton = `
  <button class="favorites" onclick="toggleFavorite('${book.id}', this)">
    <i class="${favoriteIconClass} fa-solid fa-heart"></i>
  </button>
`



  // 返回html上的結果
  return `
    <div class="book-item">
      <div>
        <img src="${cover}" alt="${title}" class="book-image"/>
      </div>
      <div class="book-details">
        <h3>${title}</h3>
        <div>
          <span class="author">${authors}</span>
          <span class="publisher">(${publisher})</span>
          <span class="published-date">${publishedDate}</span>
        </div>
        <div class="bookstars">
        <span class="PaGe">Page：${pageCount}</span>
        <span class="CateGories">${categories}</span>
        <span class="isbn">ISBN：${isbn}</span>
        </div>
        <p>${starRating}</p>
        <div class="book-button">
        <a href="${previewLink}" target="_blank" style="text-decoration: none;">
          <button class="preview-button">PREVIEW</button>
        </a>
        ${favoriteButton}
        </div>
      </div>
    </div>
  `
}

//轉換爲字串顯示書籍列表到html上面
function displayResults(books) {
  let output = books.map((book) => {
    const volumeInfo = book.volumeInfo
    return createBookItem(book, volumeInfo)
  }).join("")
  $("#results").html(output)
}

// 加入收藏
function toggleFavorite(bookId, button) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || []
  const isFavorite = favorites.includes(bookId)
  $(button).find("i").toggleClass("fav fan")
  
  if (isFavorite) {
  const index = favorites.indexOf(bookId)
  favorites.splice(index, 1)
  // window.alert("已取消收藏！")
  } else {
  favorites.push(bookId)
  // window.alert("收藏成功！")
  }
  localStorage.setItem("favorites", JSON.stringify(favorites))
  }



// 我的收藏
$(document).ready(function () {
  // 绑定搜索按钮点击事件
  $("#searchBtn").on("click", function () {
    const query = $("#searchInput").val();
    const filterType = $("#filterDropdown").val();
    searchBooks(query, filterType)
  });

  // 绑定收藏按钮点击事件
  $("#showFavorites").on("click", function () {
    displayFavorites()
  });
});

function displayFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favorites.length === 0) {
    alert("您尚未收藏任何书籍。")
    return;
  }

  // 获取收藏的书籍信息
  const promises = favorites.map((bookId) => {
    const apiKey = "AIzaSyBwSzvgc0XxoLQ9ocDFeTQ-ThI0HuweDdU"
    const url = `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apiKey}`

    return new Promise((resolve, reject) => {
      $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (data) {
          resolve(data)
        },
        error: function (error) {
          console.log("Error:", error);
          reject(error)
        },
      })
    })
  })

  // 显示收藏的书籍信息
  Promise.all(promises)
    .then((books) => {
      displayResults(books);
    })
    .catch((error) => {
      console.log("Error:", error);
      alert("Error")
    })
}

