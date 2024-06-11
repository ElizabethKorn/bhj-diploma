/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor(element) {
    if (!element) {
      throw new Error("Element does not exist");
    }
    this.element = element;
    this.registerEvents();
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    this.render(this.lastOptions);
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
   * либо обновляйте только виджет со счетами и формы создания дохода и расхода
   * для обновления приложения
   * */
  removeAccount() {
    if (this.lastOptions) {
      if (confirm("Вы действительно хотите удалить счёт?")) {
        console.log(
          `Attempting to remove account with ID: ${this.lastOptions.account_id}`
        );
        Account.remove({ id: this.lastOptions.account_id }, (err, response) => {
          if (err) {
            console.error("Error in Account.remove:", err);
            return;
          }
          console.log("Account.remove response:", response);
          if (response && response.success) {
            this.clear();
            App.updateWidgets();
            App.updateForms();
          } else {
            console.error("Account removal was not successful");
          }
        });
      }
    } else {
      console.error("No account options provided for removal");
    }
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options) {
    if (!options) {
      return;
    }
    this.lastOptions = options;
    Account.get(options.account_id, (err, response) => {
      if (err) {
        console.error("Error in Account.get:", err);
        return;
      }
      console.log("Account.get response:", response);
      if (response && response.success) {
        this.renderTitle(response.data.name);
      } else {
        console.error("Account.get response was not successful");
      }
      Transaction.list(options, (err, response) => {
        if (err) {
          console.error("Error in Transaction.list:", err);
          return;
        }
        console.log("Transaction.list response:", response);
        if (response && response.success) {
          this.renderTransactions(response.data);
        } else {
          console.error("Transaction.list response was not successful");
        }
      });
    });
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    this.renderTransactions([]);
    this.renderTitle("Название счёта");
    this.lastOptions = null;
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name) {
    const title = this.element.querySelector(".content-title");
    title.textContent = name;
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date) {
    const stringData = new Date(date);
    let day = stringData.getDate();
    let monthIndex = stringData.getMonth();
    let year = stringData.getFullYear();
    let hours = String(stringData.getHours()).padStart(2, "0");
    let min = String(stringData.getMinutes()).padStart(2, "0");

    let months = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ];
    let monthName = months[monthIndex];

    let formattedDate =
      day + " " + monthName + " " + year + " г. в " + hours + ":" + min;
    return formattedDate;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item) {
    const transactionHTML = `<div class="transaction transaction_${
      item.type
    } row">
      <div class="col-md-7 transaction__details">
        <div class="transaction__icon">
            <span class="fa fa-money fa-2x"></span>
        </div>
        <div class="transaction__info">
            <h4 class="transaction__title">${item.name}</h4>
            <!-- дата -->
            <div class="transaction__date">${this.formatDate(
              item.created_at
            )}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="transaction__summ">
        <!--  сумма -->
            ${item.sum} <span class="currency">₽</span>
        </div>
      </div>
      <div class="col-md-2 transaction__controls">
          <!-- в data-id нужно поместить id -->
          <button class="btn btn-danger transaction__remove" data-id="${
            item.id
          }">
              <i class="fa fa-trash"></i>  
          </button>
      </div>
    </div>`;
    return transactionHTML;
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data) {
    let content = this.element.querySelector(".content");
    content.innerHTML = "";
    console.log("Rendering transactions:", data);
    data.forEach((item) => {
      const transactionHTML = this.getTransactionHTML(item);
      content.insertAdjacentHTML("beforeend", transactionHTML);
    });
    this.registerTransactionEvents();
  }

  registerTransactionEvents() {
    const transactionRemove = this.element.querySelectorAll(
      ".transaction__remove"
    );
    if (transactionRemove.length > 0) {
      transactionRemove.forEach((transaction) =>
        transaction.addEventListener("click", (event) => {
          const id = event.currentTarget.dataset.id;
          console.log("Transaction remove button clicked, ID:", id);
          this.removeTransaction(id);
        })
      );
    } else {
      console.error("Transaction remove buttons not found");
    }
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction(id) {
    if (confirm("Вы действительно хотите удалить транзакцию?")) {
      console.log(`Attempting to remove transaction with ID: ${id}`);
      Transaction.remove({ id: id }, (err, response) => {
        if (err) {
          console.error("Error in Transaction.remove:", err);
          return;
        }
        console.log("Transaction.remove response:", response);
        if (response && response.success) {
          App.update();
        } else {
          console.error("Transaction removal was not successful");
        }
      });
    }
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    const removeAccountButton = this.element.querySelector(".remove-account");
    if (removeAccountButton) {
      removeAccountButton.addEventListener("click", () => {
        console.log("Remove account button clicked");
        this.removeAccount();
      });
    } else {
      console.error("Remove account button not found");
    }
  }
}
