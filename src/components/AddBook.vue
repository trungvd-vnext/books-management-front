<template>
  <div>
    <navbar-component></navbar-component>
    <div class="d-flex">
      <div class="content p-4">
        <div class="row mb-4">
          <div class="col-md">
            <div class="d-flex border">
              <div class="flex-grow-1 bg-white p-4">
                <div v-if="!submitted">
                  <b-form @submit.stop.prevent="onSubmit">
                    <b-form-group
                      id="title-input-group"
                      label="Title"
                      label-for="title-input"
                      label-cols-sm="4"
                      label-cols-lg="3"
                      content-cols-sm
                      content-cols-lg="7"
                    >
                      <b-form-input
                        id="title-input"
                        name="title-input"
                        v-model="$v.book.title.$model"
                        :state="validateState('title')"
                        aria-describedby="title-input-live-feedback"
                      ></b-form-input>

                      <b-form-invalid-feedback id="title-input-live-feedback"
                        >Title is a required field.</b-form-invalid-feedback
                      >
                    </b-form-group>

                    <b-form-group
                      id="author-input-group"
                      label="Author"
                      label-for="author-input"
                      label-cols-sm="4"
                      label-cols-lg="3"
                      content-cols-sm
                      content-cols-lg="7"
                    >
                      <b-form-input
                        id="author-input"
                        name="author-input"
                        v-model="$v.book.author.$model"
                        :state="validateState('author')"
                        aria-describedby="author-input-live-feedback"
                      ></b-form-input>

                      <b-form-invalid-feedback id="author-input-live-feedback"
                        >Author is a required field.</b-form-invalid-feedback
                      >
                    </b-form-group>

                    <b-form-group
                      id="description-input-group"
                      label="Description"
                      label-for="description-input"
                      label-cols-sm="4"
                      label-cols-lg="3"
                      content-cols-sm
                      content-cols-lg="7"
                    >
                      <b-form-textarea
                        id="description-input"
                        name="description-input"
                        v-model="$v.book.description.$model"
                        @input="assertMaxChars()"
                        :state="validateState('description')"
                        aria-describedby="description-input-live-feedback"
                        rows="3"
                        max-rows="6"
                      ></b-form-textarea>

                      <b-form-invalid-feedback
                        id="description-input-live-feedback"
                        >Description is a required
                        field.</b-form-invalid-feedback
                      >
                    </b-form-group>

                    <b-form-group
                      id="cover-input-group"
                      label="Cover Image"
                      label-for="cover-input"
                      label-cols-sm="4"
                      label-cols-lg="3"
                      content-cols-sm
                      content-cols-lg="7"
                    >
                      <b-form-file
                        id="cover-input"
                        name="cover-input"
                        v-model="$v.book.image.$model"
                        :state="validateState('image')"
                        accept="image/jpeg, image/png, image/gif"
                        placeholder="Choose an image"
                        drop-placeholder="Drop file here..."
                      ></b-form-file>
                      <div class="image-container">
                        <b-button
                          v-if="hasImage"
                          variant="danger"
                          class="btn-sm"
                          @click="clearImage"
                          >Clear image</b-button
                        >
                        <b-img
                          v-if="hasImage"
                          :src="imageSrc"
                          width="150"
                          height="250"
                          fluid
                          block
                          rounded
                        ></b-img>
                      </div>

                      <b-form-invalid-feedback id="cover-input-live-feedback"
                        >Cover image is a required
                        field.</b-form-invalid-feedback
                      >
                    </b-form-group>

                    <b-button type="submit" variant="primary">Submit</b-button>
                    <b-button class="ml-2" @click="resetForm()">Reset</b-button>
                  </b-form>
                </div>

                <div v-else>
                  <h4>You submitted successfully!</h4>
                  <button class="btn btn-success" @click="newBook">Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import BookDataService from "../services/BookDataService";

const base64Encode = (data) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default {
  mixins: [validationMixin],
  data() {
    return {
      book: {
        id: null,
        title: null,
        author: null,
        description: null,
        published: false,
        image: null,
      },
      imageSrc: null,
      submitted: false,
      maxLengthInCars: 250,
    };
  },

  computed: {
    hasImage() {
      if (!this.book.image) return;

      var fileSize = this.book.image.size / 1024 / 1024;
      if (fileSize > 5) {
        alert("File size exceeds 5 MiB");
        return (this.book.image = null);
      }

      var fileType = this.book.image.type;
      if (
        fileType !== "image/jpeg" ||
        fileType !== "image/jpeg" ||
        fileType !== "image/jpeg"
      ) {
        alert("Only accept image file input (jpeg, png, gif)");
        return (this.book.image = null);
      }

      return !!this.book.image;
    },
    image() {
      return this.book.image;
    },
  },

  watch: {
    image(newValue, oldValue) {
      if (newValue !== oldValue) {
        if (newValue) {
          base64Encode(newValue)
            .then((value) => {
              this.imageSrc = value;
            })
            .catch(() => {
              this.imageSrc = null;
            });
        } else {
          this.imageSrc = null;
        }
      }
    },
  },

  validations: {
    book: {
      title: { required },
      author: { required },
      description: { required },
      image: { required },
    },
  },
  methods: {
    clearImage() {
      this.book.image = null;
    },

    assertMaxChars: function () {
      if (this.value.length >= this.maxLengthInCars) {
        this.value = this.value.substring(0, this.maxLengthInCars);
      }
    },

    validateState(title) {
      const { $dirty, $error } = this.$v.book[title];
      return $dirty ? !$error : null;
    },

    resetForm() {
      this.book = {
        title: null,
        author: null,
        description: null,
        image: null,
      };

      this.$nextTick(() => {
        this.$v.$reset();
      });
    },
    onSubmit() {
      this.$v.book.$touch();
      if (this.$v.book.$anyError) {
        return;
      }

      var data = {
        title: this.book.title,
        author: this.book.author,
        description: this.book.description,
        image: this.book.image,
      };

      var form = new FormData();
      form.append("book", JSON.stringify(data));
      form.append("file", this.book.image);

      BookDataService.create(form)
        .then((response) => {
          this.book.id = response.data.id;
          console.log(response.data);
          this.submitted = true;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    newBook() {
      this.submitted = false;
      this.book = {
        title: null,
        author: null,
        description: null,
        image: null,
      };
      this.imageSrc = null;
      this.$v.$reset();
    },
  },
};
</script>

<style >
.image-container {
  position: relative;
  max-width: 400px;
  margin-top: 1rem;
}

.image-container .btn {
  position: absolute;
}
</style>